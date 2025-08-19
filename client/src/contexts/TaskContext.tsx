import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  onSnapshot,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthContext";
import NotificationManager from "@/lib/notifications";

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "todo" | "progress" | "done";
  completed: boolean;
  dueDate: Timestamp;
  dueTime?: string;
  createdAt: Timestamp;
}

export interface CreateTaskData {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "todo" | "progress" | "done";
  dueDate: Date;
  dueTime?: string;
}

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  addTask: (taskData: CreateTaskData) => Promise<void>;
  editTask: (id: string, updates: Partial<CreateTaskData>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskCompletion: (id: string) => Promise<void>;
  setTaskPriority: (id: string, priority: "low" | "medium" | "high") => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function useTask() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTask must be used within a TaskProvider");
  }
  return context;
}

interface TaskProviderProps {
  children: ReactNode;
}

export function TaskProvider({ children }: TaskProviderProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setTasks([]);
      setLoading(false);
      return;
    }

    const tasksRef = collection(db, `users/${currentUser.uid}/tasks`);
    const q = query(tasksRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const tasksData: Task[] = [];
        snapshot.forEach((doc) => {
          tasksData.push({ id: doc.id, ...doc.data() } as Task);
        });
        setTasks(tasksData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching tasks:", error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [currentUser]);

  const addTask = async (taskData: CreateTaskData) => {
    if (!currentUser) throw new Error("User must be authenticated");

    try {
      const tasksRef = collection(db, `users/${currentUser.uid}/tasks`);
      const docRef = await addDoc(tasksRef, {
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        status: taskData.status,
        completed: false,
        dueDate: Timestamp.fromDate(taskData.dueDate),
        dueTime: taskData.dueTime,
        createdAt: serverTimestamp(),
      });

      // Schedule notification if dueTime is provided
      if (taskData.dueTime && Notification.permission === 'granted') {
        await NotificationManager.scheduleTaskReminder({
          taskId: docRef.id,
          title: taskData.title,
          body: taskData.description,
          dueTime: taskData.dueTime
        });
        console.log(`Scheduled reminder for "${taskData.title}" at ${taskData.dueTime}`);
      }
    } catch (error) {
      console.error("Error adding task:", error);
      throw error;
    }
  };

  const editTask = async (id: string, updates: Partial<CreateTaskData>) => {
    if (!currentUser) throw new Error("User must be authenticated");

    try {
      const taskRef = doc(db, `users/${currentUser.uid}/tasks`, id);
      const updateData: any = { ...updates };
      
      if (updates.dueDate) {
        updateData.dueDate = Timestamp.fromDate(updates.dueDate);
      }
      
      await updateDoc(taskRef, updateData);
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  };

  const deleteTask = async (id: string) => {
    if (!currentUser) throw new Error("User must be authenticated");

    try {
      const taskRef = doc(db, `users/${currentUser.uid}/tasks`, id);
      await deleteDoc(taskRef);
      
      // Cancel any pending notifications for this task
      await NotificationManager.cancelTaskReminder(id);
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  };

  const toggleTaskCompletion = async (id: string) => {
    if (!currentUser) throw new Error("User must be authenticated");

    try {
      const task = tasks.find(t => t.id === id);
      if (!task) throw new Error("Task not found");

      const taskRef = doc(db, `users/${currentUser.uid}/tasks`, id);
      const newCompleted = !task.completed;
      await updateDoc(taskRef, {
        completed: newCompleted,
        status: newCompleted ? "done" : "todo",
      });
    } catch (error) {
      console.error("Error toggling task completion:", error);
      throw error;
    }
  };

  const setTaskPriority = async (id: string, priority: "low" | "medium" | "high") => {
    if (!currentUser) throw new Error("User must be authenticated");

    try {
      const taskRef = doc(db, `users/${currentUser.uid}/tasks`, id);
      await updateDoc(taskRef, { priority });
    } catch (error) {
      console.error("Error updating task priority:", error);
      throw error;
    }
  };

  const value: TaskContextType = {
    tasks,
    loading,
    addTask,
    editTask,
    deleteTask,
    toggleTaskCompletion,
    setTaskPriority,
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
}
