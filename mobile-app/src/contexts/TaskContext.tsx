import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy,
  where,
  Timestamp 
} from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';

// Initialize Firestore
const app = initializeApp({
  apiKey: "AIzaSyBGK8R5fxLYDfb_iA8BNlXDY2gR8Lxf_v4",
  authDomain: "dayfuse-web.firebaseapp.com",
  projectId: "dayfuse-web",
});
const db = getFirestore(app);

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  dueTime?: string;
  category: string;
  recurring?: {
    pattern: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleTaskComplete: (taskId: string) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTask = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};

interface TaskProviderProps {
  children: ReactNode;
}

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { scheduleTaskReminder, cancelTaskReminder } = useNotifications();

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    const tasksRef = collection(db, 'users', user.uid, 'tasks');
    const q = query(tasksRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData: Task[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        tasksData.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          dueDate: data.dueDate?.toDate(),
        } as Task);
      });
      
      setTasks(tasksData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching tasks:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const tasksRef = collection(db, 'users', user.uid, 'tasks');
      const now = new Date();
      
      const firestoreData = {
        ...taskData,
        dueDate: taskData.dueDate ? Timestamp.fromDate(taskData.dueDate) : null,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
      };

      const docRef = await addDoc(tasksRef, firestoreData);

      // Schedule notification if task has due date and time
      if (taskData.dueDate && taskData.dueTime) {
        const [hours, minutes] = taskData.dueTime.split(':').map(Number);
        const notificationTime = new Date(taskData.dueDate);
        notificationTime.setHours(hours, minutes);

        if (notificationTime > new Date()) {
          await scheduleTaskReminder(
            docRef.id,
            `Task Due: ${taskData.title}`,
            taskData.description || 'Your task is due now!',
            notificationTime
          );
        }
      }

      console.log('Task added successfully');
    } catch (error: any) {
      console.error('Error adding task:', error);
      throw new Error(error.message || 'Failed to add task');
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const taskRef = doc(db, 'users', user.uid, 'tasks', taskId);
      
      const firestoreUpdates = {
        ...updates,
        dueDate: updates.dueDate ? Timestamp.fromDate(updates.dueDate) : null,
        updatedAt: Timestamp.fromDate(new Date()),
      };

      await updateDoc(taskRef, firestoreUpdates);

      // Update notification if due date/time changed
      if ('dueDate' in updates || 'dueTime' in updates) {
        await cancelTaskReminder(taskId);
        
        if (updates.dueDate && updates.dueTime) {
          const [hours, minutes] = updates.dueTime.split(':').map(Number);
          const notificationTime = new Date(updates.dueDate);
          notificationTime.setHours(hours, minutes);

          if (notificationTime > new Date()) {
            const task = tasks.find(t => t.id === taskId);
            if (task) {
              await scheduleTaskReminder(
                taskId,
                `Task Due: ${updates.title || task.title}`,
                updates.description || task.description || 'Your task is due now!',
                notificationTime
              );
            }
          }
        }
      }

      console.log('Task updated successfully');
    } catch (error: any) {
      console.error('Error updating task:', error);
      throw new Error(error.message || 'Failed to update task');
    }
  };

  const deleteTask = async (taskId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const taskRef = doc(db, 'users', user.uid, 'tasks', taskId);
      await deleteDoc(taskRef);
      
      // Cancel any scheduled notifications
      await cancelTaskReminder(taskId);
      
      console.log('Task deleted successfully');
    } catch (error: any) {
      console.error('Error deleting task:', error);
      throw new Error(error.message || 'Failed to delete task');
    }
  };

  const toggleTaskComplete = async (taskId: string): Promise<void> => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');

    await updateTask(taskId, { 
      completed: !task.completed,
      updatedAt: new Date()
    });

    // Cancel notification when task is completed
    if (!task.completed) {
      await cancelTaskReminder(taskId);
    }
  };

  const contextValue: TaskContextType = {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
  };

  return (
    <TaskContext.Provider value={contextValue}>
      {children}
    </TaskContext.Provider>
  );
};