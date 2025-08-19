import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Task } from '../components/TaskCard';
import { useAuth } from './AuthContext';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  orderBy 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function useTask() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
}

interface TaskProviderProps {
  children: ReactNode;
}

export function TaskProvider({ children }: TaskProviderProps) {
  const [tasks, setTasks] = useState<Task[]>([
    // Demo tasks to get started
    {
      id: '1',
      title: 'Review daily goals',
      description: 'Plan and prioritize tasks for maximum productivity',
      completed: false,
      priority: 'high',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      dueTime: '09:00',
      tags: ['planning', 'goals'],
      createdAt: new Date(),
    },
    {
      id: '2',
      title: 'Complete project proposal',
      description: 'Finalize and submit the Q4 project proposal',
      completed: false,
      priority: 'medium',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      tags: ['work', 'deadline'],
      createdAt: new Date(),
    },
    {
      id: '3',
      title: 'Exercise for 30 minutes',
      description: 'Morning workout routine for health and energy',
      completed: true,
      priority: 'low',
      tags: ['health', 'fitness'],
      createdAt: new Date(),
      completedAt: new Date(),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // For now, use local state instead of Firestore to avoid permission issues
  // This would normally sync with Firebase when properly configured
  useEffect(() => {
    if (!user) {
      // Keep demo tasks even when not logged in for demo purposes
      setLoading(false);
    } else {
      setLoading(false);
      // TODO: Implement Firebase sync when authentication is configured
    }
  }, [user]);

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    
    setTasks(prevTasks => [newTask, ...prevTasks]);
    // TODO: Sync to Firebase when configured
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === id 
          ? { 
              ...task, 
              ...updates,
              ...(updates.completed && { completedAt: new Date() })
            }
          : task
      )
    );
    // TODO: Sync to Firebase when configured
  };

  const deleteTask = async (id: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
    // TODO: Sync to Firebase when configured
  };

  const toggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      await updateTask(id, { 
        completed: !task.completed,
        completedAt: !task.completed ? new Date() : undefined
      });
    }
  };

  const value = {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
}