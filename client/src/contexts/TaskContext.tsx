import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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

export interface RecurringTaskInput extends TaskInput {
  recurring: boolean;
  recurringPattern: 'daily' | 'weekly' | 'monthly';
  recurringDays?: string[]; // For weekly: ['monday', 'tuesday', etc.]
  recurringEndDate?: Date;
}

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  addTask: (task: TaskInput | RecurringTaskInput) => Promise<void>;
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

  const addTask = async (taskInput: TaskInput | RecurringTaskInput) => {
    if (!currentUser) throw new Error('User not authenticated');

    // Check if this is a recurring task
    const isRecurring = 'recurring' in taskInput && taskInput.recurring;
    
    if (isRecurring) {
      await createRecurringTasks(taskInput as RecurringTaskInput);
    } else {
      await createSingleTask(taskInput);
    }
  };

  const createSingleTask = async (taskInput: TaskInput) => {
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

      // Use the enhanced notification manager
      const { notificationManager } = await import('@/lib/notifications');
      
      // Schedule notification for the due time only (removed duplicate scheduling)
      await notificationManager.scheduleTaskReminder({
        id: docRef.id,
        title: taskInput.title,
        dueTime: taskDateTime,
        description: taskInput.description
      });
    }
  };

  const createRecurringTasks = async (recurringInput: RecurringTaskInput) => {
    if (!currentUser) return;

    const { recurring, recurringPattern, recurringDays, recurringEndDate, ...baseTask } = recurringInput;
    
    // Create a SINGLE recurring task instead of multiple instances
    const tasksRef = collection(db, 'users', currentUser.uid, 'tasks');
    const taskDoc = await addDoc(tasksRef, {
      ...baseTask,
      title: `${baseTask.title} (${recurringPattern})`,
      completed: false,
      isRecurring: true,
      recurringPattern,
      recurringDays,
      recurringEndDate: recurringEndDate ? Timestamp.fromDate(recurringEndDate) : null,
      lastCompletedDate: null,
      nextDueDate: baseTask.dueDate, // Track the next occurrence
      createdAt: serverTimestamp(),
    });

    // Schedule notification only for the FIRST occurrence
    if (baseTask.dueTime) {
      const taskDateTime = new Date(baseTask.dueDate.toDate());
      const [hours, minutes] = baseTask.dueTime.split(':').map(Number);
      taskDateTime.setHours(hours, minutes, 0, 0);

      const { notificationManager } = await import('@/lib/notifications');
      
      await notificationManager.scheduleTaskReminder({
        id: taskDoc.id,
        title: baseTask.title,
        dueTime: taskDateTime,
        description: baseTask.description
      });
    }
  };

  const generateRecurringInstances = (
    startDate: Date, 
    endDate: Date, 
    pattern: 'daily' | 'weekly' | 'monthly',
    selectedDays?: string[]
  ): Date[] => {
    const instances: Date[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      if (pattern === 'daily') {
        instances.push(new Date(current));
        current.setDate(current.getDate() + 1);
      } else if (pattern === 'weekly') {
        if (selectedDays && selectedDays.length > 0) {
          // Check if current day matches selected days
          const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
          const currentDayName = dayNames[current.getDay()];
          
          if (selectedDays.includes(currentDayName)) {
            instances.push(new Date(current));
          }
          current.setDate(current.getDate() + 1);
        } else {
          // Weekly on the same day
          instances.push(new Date(current));
          current.setDate(current.getDate() + 7);
        }
      } else if (pattern === 'monthly') {
        instances.push(new Date(current));
        current.setMonth(current.getMonth() + 1);
      }
    }

    return instances;
  };

  const editTask = async (taskId: string, updates: Partial<TaskInput>) => {
    if (!currentUser) throw new Error('User not authenticated');

    const taskRef = doc(db, 'users', currentUser.uid, 'tasks', taskId);
    await updateDoc(taskRef, updates);

    // Handle notification updates
    if (updates.dueTime !== undefined || updates.dueDate !== undefined) {
      const { notificationManager } = await import('@/lib/notifications');
      
      // Cancel existing notifications
      notificationManager.cancelNotification(taskId);
      notificationManager.cancelNotification(`${taskId}_reminder`);

      // Schedule new notifications if there's a due time
      if (updates.dueTime) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
          const taskDateTime = new Date((updates.dueDate || task.dueDate).toDate());
          const [hours, minutes] = updates.dueTime.split(':').map(Number);
          taskDateTime.setHours(hours, minutes, 0, 0);

          await notificationManager.scheduleTaskReminder({
            id: taskId,
            title: updates.title || task.title,
            dueTime: taskDateTime,
            description: updates.description || task.description
          });

          const oneMinuteAfter = new Date(taskDateTime.getTime() + 60000);
          await notificationManager.scheduleTaskReminder({
            id: `${taskId}_reminder`,
            title: `Follow-up: ${updates.title || task.title}`,
            dueTime: oneMinuteAfter,
            description: updates.description || task.description
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
    const { notificationManager } = await import('@/lib/notifications');
    notificationManager.cancelNotification(taskId);
    notificationManager.cancelNotification(`${taskId}_reminder`);
  };

  const toggleTaskCompletion = async (taskId: string) => {
    if (!currentUser) throw new Error('User not authenticated');

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const taskRef = doc(db, 'users', currentUser.uid, 'tasks', taskId);
    const newCompleted = !task.completed;
    const newStatus = newCompleted ? 'done' : 'todo';
    
    // Handle recurring tasks differently when completed
    if (newCompleted && task.isRecurring) {
      const nextOccurrence = calculateNextOccurrence(
        task.nextDueDate ? task.nextDueDate.toDate() : task.dueDate.toDate(),
        task.recurringPattern,
        task.recurringDays
      );
      
      // Check if we've reached the end date
      const shouldContinue = !task.recurringEndDate || nextOccurrence <= task.recurringEndDate.toDate();
      
      if (shouldContinue) {
        // Update task with next occurrence instead of marking completed
        await updateDoc(taskRef, {
          lastCompletedDate: serverTimestamp(),
          nextDueDate: Timestamp.fromDate(nextOccurrence),
          dueDate: Timestamp.fromDate(nextOccurrence),
          completed: false, // Keep task active with new due date
          status: 'todo'
        });
        
        // Cancel current notifications and schedule for next occurrence
        cancelNotification(taskId);
        cancelNotification(`${taskId}_reminder`);
        
        if (task.dueTime) {
          const taskDateTime = new Date(nextOccurrence);
          const [hours, minutes] = task.dueTime.split(':').map(Number);
          taskDateTime.setHours(hours, minutes, 0, 0);

          const { notificationManager } = await import('@/lib/notifications');
          
          await notificationManager.scheduleTaskReminder({
            id: taskId,
            title: task.title,
            dueTime: taskDateTime,
            description: task.description
          });
        }
      } else {
        // End of recurrence period, mark as completed
        await updateDoc(taskRef, {
          completed: true,
          status: 'done',
          lastCompletedDate: serverTimestamp()
        });
        
        // Cancel notifications
        cancelNotification(taskId);
        cancelNotification(`${taskId}_reminder`);
      }
    } else {
      // Regular task or uncompleting a recurring task
      await updateDoc(taskRef, { 
        completed: newCompleted,
        status: newStatus
      });

      // Cancel notifications if task is completed
      if (newCompleted) {
        cancelNotification(taskId);
        cancelNotification(`${taskId}_reminder`);
      }
    }
  };

  const calculateNextOccurrence = (
    currentDate: Date,
    pattern: 'daily' | 'weekly' | 'monthly',
    selectedDays?: string[]
  ): Date => {
    const nextDate = new Date(currentDate);
    
    switch (pattern) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'weekly':
        if (selectedDays && selectedDays.length > 0) {
          // Find next selected day
          const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
          const currentDayIndex = nextDate.getDay();
          let daysToAdd = 1;
          
          // Look for next selected day within the next 7 days
          for (let i = 1; i <= 7; i++) {
            const testDayIndex = (currentDayIndex + i) % 7;
            const testDayName = dayNames[testDayIndex];
            if (selectedDays.includes(testDayName)) {
              daysToAdd = i;
              break;
            }
          }
          nextDate.setDate(nextDate.getDate() + daysToAdd);
        } else {
          nextDate.setDate(nextDate.getDate() + 7);
        }
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
    }
    
    return nextDate;
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