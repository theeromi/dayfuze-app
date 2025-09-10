import { 
  type User, 
  type InsertUser,
  type PushSubscription,
  type InsertPushSubscription,
  type Task,
  type InsertTask,
  type ScheduledNotification,
  type InsertScheduledNotification
} from "../shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Push subscription methods
  createPushSubscription(subscription: InsertPushSubscription): Promise<PushSubscription>;
  getPushSubscriptionsByUserId(userId: string): Promise<PushSubscription[]>;
  deletePushSubscription(id: string): Promise<void>;
  updatePushSubscriptionStatus(id: string, isActive: boolean): Promise<void>;
  
  // Task methods
  createTask(task: InsertTask): Promise<Task>;
  getTaskById(id: string): Promise<Task | undefined>;
  getTasksByUserId(userId: string): Promise<Task[]>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<void>;
  
  // Scheduled notification methods
  createScheduledNotification(notification: InsertScheduledNotification): Promise<ScheduledNotification>;
  getScheduledNotificationsByUserId(userId: string): Promise<ScheduledNotification[]>;
  getPendingNotifications(): Promise<ScheduledNotification[]>;
  markNotificationAsSent(id: string): Promise<void>;
  deleteScheduledNotification(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private pushSubscriptions: Map<string, PushSubscription>;
  private tasks: Map<string, Task>;
  private scheduledNotifications: Map<string, ScheduledNotification>;

  constructor() {
    this.users = new Map();
    this.pushSubscriptions = new Map();
    this.tasks = new Map();
    this.scheduledNotifications = new Map();
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Push subscription methods
  async createPushSubscription(insertSubscription: InsertPushSubscription): Promise<PushSubscription> {
    const id = randomUUID();
    const subscription: PushSubscription = {
      ...insertSubscription,
      id,
      userId: insertSubscription.userId ?? null,
      userAgent: insertSubscription.userAgent ?? null,
      createdAt: new Date(),
      isActive: true,
    };
    this.pushSubscriptions.set(id, subscription);
    return subscription;
  }

  async getPushSubscriptionsByUserId(userId: string): Promise<PushSubscription[]> {
    return Array.from(this.pushSubscriptions.values()).filter(
      (sub) => sub.userId === userId && sub.isActive,
    );
  }

  async deletePushSubscription(id: string): Promise<void> {
    this.pushSubscriptions.delete(id);
  }

  async updatePushSubscriptionStatus(id: string, isActive: boolean): Promise<void> {
    const subscription = this.pushSubscriptions.get(id);
    if (subscription) {
      subscription.isActive = isActive;
      this.pushSubscriptions.set(id, subscription);
    }
  }

  // Task methods
  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = randomUUID();
    const task: Task = {
      ...insertTask,
      id,
      userId: insertTask.userId ?? null,
      description: insertTask.description ?? null,
      dueTime: insertTask.dueTime ?? null,
      completed: false,
      createdAt: new Date(),
    };
    this.tasks.set(id, task);
    return task;
  }

  async getTaskById(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async getTasksByUserId(userId: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.userId === userId,
    );
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (task) {
      const updatedTask = { ...task, ...updates };
      this.tasks.set(id, updatedTask);
      return updatedTask;
    }
    return undefined;
  }

  async deleteTask(id: string): Promise<void> {
    this.tasks.delete(id);
  }

  // Scheduled notification methods
  async createScheduledNotification(insertNotification: InsertScheduledNotification): Promise<ScheduledNotification> {
    const id = randomUUID();
    const notification: ScheduledNotification = {
      ...insertNotification,
      id,
      userId: insertNotification.userId ?? null,
      taskId: insertNotification.taskId ?? null,
      sent: false,
      sentAt: null,
      createdAt: new Date(),
    };
    this.scheduledNotifications.set(id, notification);
    return notification;
  }

  async getScheduledNotificationsByUserId(userId: string): Promise<ScheduledNotification[]> {
    return Array.from(this.scheduledNotifications.values()).filter(
      (notification) => notification.userId === userId,
    );
  }

  async getPendingNotifications(): Promise<ScheduledNotification[]> {
    const now = new Date();
    return Array.from(this.scheduledNotifications.values()).filter(
      (notification) => !notification.sent && notification.scheduledTime <= now,
    );
  }

  async markNotificationAsSent(id: string): Promise<void> {
    const notification = this.scheduledNotifications.get(id);
    if (notification) {
      notification.sent = true;
      notification.sentAt = new Date();
      this.scheduledNotifications.set(id, notification);
    }
  }

  async deleteScheduledNotification(id: string): Promise<void> {
    this.scheduledNotifications.delete(id);
  }
}

export const storage = new MemStorage();
