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
import { db } from '../firebase';
import { useAuth } from './AuthContext';

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

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

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
    await addDoc(tasksRef, {
      ...taskInput,
      completed: false,
      createdAt: serverTimestamp(),
    });
  };

  const editTask = async (taskId: string, updates: Partial<TaskInput>) => {
    if (!currentUser) throw new Error('User not authenticated');

    const taskRef = doc(db, 'users', currentUser.uid, 'tasks', taskId);
    await updateDoc(taskRef, updates);
  };

  const deleteTask = async (taskId: string) => {
    if (!currentUser) throw new Error('User not authenticated');

    const taskRef = doc(db, 'users', currentUser.uid, 'tasks', taskId);
    await deleteDoc(taskRef);
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
};