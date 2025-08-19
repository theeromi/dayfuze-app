import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'progress' | 'done';
  dueDate: Timestamp;
  dueTime?: string;
  completed: boolean;
  createdAt: Timestamp;
}

export interface TaskInput {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'progress' | 'done';
  dueDate: Timestamp;
  dueTime?: string;
}

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  addTask: (task: TaskInput) => Promise<void>;
  editTask: (taskId: string, updates: Partial<TaskInput>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleTaskCompletion: (taskId: string) => Promise<void>;
  setTaskPriority: (taskId: string, priority: 'low' | 'medium' | 'high') => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTask = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};

interface TaskProviderProps {
  children: ReactNode;
}

export function TaskProvider({ children }: TaskProviderProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const { scheduleNotification, cancelNotification } = useNotification();

  useEffect(() => {
    if (!currentUser) {
      setTasks([]);
      setLoading(false);
      return;
    }

    const tasksRef = collection(db, 'users', currentUser.uid, 'tasks');
    const q = query(tasksRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskList: Task[] = [];
      snapshot.forEach((doc) => {
        taskList.push({ id: doc.id, ...doc.data() } as Task);
      });
      setTasks(taskList);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  const addTask = async (taskInput: TaskInput) => {
    if (!currentUser) throw new Error('User not authenticated');

    const tasksRef = collection(db, 'users', currentUser.uid, 'tasks');
    const docRef = await addDoc(tasksRef, {
      ...taskInput,
      completed: false,
      createdAt: serverTimestamp(),
    });

    // Schedule notification if task has a due time
    if (taskInput.dueTime) {
      const taskDateTime = new Date(taskInput.dueDate.toDate());
      const [hours, minutes] = taskInput.dueTime.split(':').map(Number);
      taskDateTime.setHours(hours, minutes, 0, 0);

      // Schedule notification for the due time
      scheduleNotification(docRef.id, {
        title: 'Task Reminder',
        body: `Time for: ${taskInput.title}`,
        scheduledTime: taskDateTime,
      });

      // Also schedule a notification 1 minute after
      const oneMinuteAfter = new Date(taskDateTime.getTime() + 60000);
      scheduleNotification(`${docRef.id}_reminder`, {
        title: 'Task Follow-up',
        body: `Don't forget: ${taskInput.title}`,
        scheduledTime: oneMinuteAfter,
      });
    }
  };

  const editTask = async (taskId: string, updates: Partial<TaskInput>) => {
    if (!currentUser) throw new Error('User not authenticated');

    const taskRef = doc(db, 'users', currentUser.uid, 'tasks', taskId);
    await updateDoc(taskRef, updates);

    // Handle notification updates
    if (updates.dueTime !== undefined || updates.dueDate !== undefined) {
      // Cancel existing notifications
      cancelNotification(taskId);
      cancelNotification(`${taskId}_reminder`);

      // Schedule new notifications if there's a due time
      if (updates.dueTime) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
          const taskDateTime = new Date((updates.dueDate || task.dueDate).toDate());
          const [hours, minutes] = updates.dueTime.split(':').map(Number);
          taskDateTime.setHours(hours, minutes, 0, 0);

          scheduleNotification(taskId, {
            title: 'Task Reminder',
            body: `Time for: ${updates.title || task.title}`,
            scheduledTime: taskDateTime,
          });

          const oneMinuteAfter = new Date(taskDateTime.getTime() + 60000);
          scheduleNotification(`${taskId}_reminder`, {
            title: 'Task Follow-up',
            body: `Don't forget: ${updates.title || task.title}`,
            scheduledTime: oneMinuteAfter,
          });
        }
      }
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!currentUser) throw new Error('User not authenticated');

    const taskRef = doc(db, 'users', currentUser.uid, 'tasks', taskId);
    await deleteDoc(taskRef);

    // Cancel notifications for deleted task
    cancelNotification(taskId);
    cancelNotification(`${taskId}_reminder`);
  };

  const toggleTaskCompletion = async (taskId: string) => {
    if (!currentUser) throw new Error('User not authenticated');

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const taskRef = doc(db, 'users', currentUser.uid, 'tasks', taskId);
    const newCompleted = !task.completed;
    const newStatus = newCompleted ? 'done' : 'todo';
    
    await updateDoc(taskRef, { 
      completed: newCompleted,
      status: newStatus
    });

    // Cancel notifications if task is completed
    if (newCompleted) {
      cancelNotification(taskId);
      cancelNotification(`${taskId}_reminder`);
    }
  };

  const setTaskPriority = async (taskId: string, priority: 'low' | 'medium' | 'high') => {
    if (!currentUser) throw new Error('User not authenticated');

    const taskRef = doc(db, 'users', currentUser.uid, 'tasks', taskId);
    await updateDoc(taskRef, { priority });
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

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}