import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { sendContactEmail, sendAutoReply, type ContactFormData } from "./emailService";
import { multiServiceEmailSend } from "./alternativeEmailService";
import { pushNotificationService } from "./pushNotificationService";
import { 
  insertPushSubscriptionSchema, 
  insertTaskSchema, 
  insertScheduledNotificationSchema 
} from "../shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint for deployment monitoring
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || 'development',
      port: process.env.PORT || '5000'
    });
  });

  // Contact form endpoint
  app.post('/api/contact', async (req, res) => {
    try {
      const { name, email, subject, message } = req.body as ContactFormData;

      // Validate required fields
      if (!name || !email || !subject || !message) {
        return res.status(400).json({ 
          error: 'Missing required fields',
          message: 'Please fill in all required fields' 
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          error: 'Invalid email format',
          message: 'Please enter a valid email address' 
        });
      }

      // Try multiple email sending methods
      console.log('📧 Processing contact form submission...');
      
      // First try SendGrid if available
      let emailResult: { success: boolean; method: string; error?: string } = { success: false, method: 'none', error: '' };
      
      if (process.env.SENDGRID_API_KEY) {
        try {
          const sendGridSuccess = await sendContactEmail({ name, email, subject, message });
          if (sendGridSuccess) {
            emailResult = { success: true, method: 'sendgrid' };
            console.log('✅ Email sent via SendGrid');
          }
        } catch (error) {
          console.warn('SendGrid failed, trying alternative methods:', error);
        }
      }

      // If SendGrid fails or is not available, use multi-service fallback
      if (!emailResult.success) {
        emailResult = await multiServiceEmailSend({ name, email, subject, message });
      }

      if (!emailResult.success) {
        console.error('All email services failed:', emailResult.error || 'Unknown error');
        return res.status(500).json({ 
          error: 'Failed to send email',
          message: 'We couldn\'t send your message at this time. Please try again later or email us directly at contact@romaintomlinson.com' 
        });
      }

      console.log(`📨 Email processed successfully via ${emailResult.method}`);
      
      // Try to send auto-reply (optional, don't fail if this fails)
      if (emailResult.method === 'sendgrid') {
        await sendAutoReply(email, name).catch(err => 
          console.warn('Auto-reply failed:', err)
        );
      }

      res.json({ 
        success: true,
        message: 'Your message has been sent successfully! We\'ll get back to you within 24 hours.',
        method: emailResult.method
      });

    } catch (error) {
      console.error('Contact form error:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Something went wrong. Please try again later or email us directly at contact@romaintomlinson.com' 
      });
    }
  });

  // Get VAPID public key for client subscription
  app.get('/api/push/vapid-public-key', (req, res) => {
    res.json({ 
      publicKey: pushNotificationService.getVapidPublicKey() 
    });
  });

  // Register push subscription
  app.post('/api/push/subscribe', async (req, res) => {
    try {
      const subscriptionData = insertPushSubscriptionSchema.parse(req.body);
      
      const subscription = await storage.createPushSubscription(subscriptionData);
      
      res.json({ 
        success: true, 
        message: 'Push subscription registered successfully',
        subscriptionId: subscription.id
      });
    } catch (error: any) {
      console.error('Error registering push subscription:', error);
      res.status(400).json({ 
        error: 'Invalid subscription data',
        message: error.message || 'Failed to register push subscription'
      });
    }
  });

  // Unregister push subscription
  app.delete('/api/push/unsubscribe/:subscriptionId', async (req, res) => {
    try {
      const { subscriptionId } = req.params;
      
      await storage.deletePushSubscription(subscriptionId);
      
      res.json({ 
        success: true, 
        message: 'Push subscription removed successfully' 
      });
    } catch (error) {
      console.error('Error unregistering push subscription:', error);
      res.status(500).json({ 
        error: 'Failed to unregister push subscription',
        message: 'Please try again later'
      });
    }
  });

  // Create task with optional notification scheduling
  app.post('/api/tasks', async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      
      const task = await storage.createTask(taskData);
      
      // If task has a due time, schedule notification
      if (task.dueTime) {
        const notificationTime = new Date(task.dueTime.getTime());
        
        if (task.userId) {
          await pushNotificationService.scheduleNotification(
            task.userId,
          task.id,
          `📋 Task Due: ${task.title}`,
          task.description || 'Your task is due now!',
            notificationTime
          );
        }
      }
      
      res.json({ 
        success: true, 
        task,
        message: task.dueTime ? 'Task created with notification scheduled' : 'Task created successfully'
      });
    } catch (error: any) {
      console.error('Error creating task:', error);
      res.status(400).json({ 
        error: 'Invalid task data',
        message: error.message || 'Failed to create task'
      });
    }
  });

  // Get tasks for user
  app.get('/api/tasks/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      
      const tasks = await storage.getTasksByUserId(userId);
      
      res.json({ 
        success: true, 
        tasks 
      });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ 
        error: 'Failed to fetch tasks',
        message: 'Please try again later'
      });
    }
  });

  // Update task (including completion)
  app.patch('/api/tasks/:taskId', async (req, res) => {
    try {
      const { taskId } = req.params;
      const updates = req.body;
      
      const task = await storage.updateTask(taskId, updates);
      
      if (!task) {
        return res.status(404).json({ 
          error: 'Task not found',
          message: 'The specified task could not be found'
        });
      }

      // If task is completed, cancel any pending notifications
      if (updates.completed === true) {
        await pushNotificationService.cancelScheduledNotifications(taskId);
      }
      
      res.json({ 
        success: true, 
        task,
        message: 'Task updated successfully'
      });
    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ 
        error: 'Failed to update task',
        message: 'Please try again later'
      });
    }
  });

  // Delete task
  app.delete('/api/tasks/:taskId', async (req, res) => {
    try {
      const { taskId } = req.params;
      
      // Cancel any pending notifications for this task
      await pushNotificationService.cancelScheduledNotifications(taskId);
      
      await storage.deleteTask(taskId);
      
      res.json({ 
        success: true, 
        message: 'Task deleted successfully' 
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({ 
        error: 'Failed to delete task',
        message: 'Please try again later'
      });
    }
  });

  // Test push notification endpoint
  app.post('/api/push/test/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const { title = 'DayFuse Test', body = 'Push notifications are working!' } = req.body;
      
      const result = await pushNotificationService.sendNotificationToUser(userId, {
        title,
        body,
        icon: '/dayfuse-logo-192.png',
        data: { test: true }
      });
      
      res.json({ 
        success: true, 
        message: `Test notification sent: ${result.sent} successful, ${result.failed} failed`,
        result
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
      res.status(500).json({ 
        error: 'Failed to send test notification',
        message: 'Please try again later'
      });
    }
  });

  // Get scheduled notifications for user
  app.get('/api/notifications/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      
      const notifications = await storage.getScheduledNotificationsByUserId(userId);
      
      res.json({ 
        success: true, 
        notifications 
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ 
        error: 'Failed to fetch notifications',
        message: 'Please try again later'
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
