import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { sendContactEmail, sendAutoReply, type ContactFormData } from "./emailService";

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

      // Send the contact email
      const emailSent = await sendContactEmail({ name, email, subject, message });
      
      if (!emailSent) {
        return res.status(500).json({ 
          error: 'Failed to send email',
          message: 'We couldn\'t send your message at this time. Please try again later or email us directly at contact@romaintomlinson.com' 
        });
      }

      // Send auto-reply to user (optional, don't fail if this fails)
      await sendAutoReply(email, name).catch(err => 
        console.warn('Auto-reply failed:', err)
      );

      res.json({ 
        success: true,
        message: 'Your message has been sent successfully! We\'ll get back to you within 24 hours.' 
      });

    } catch (error) {
      console.error('Contact form error:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Something went wrong. Please try again later or email us directly at contact@romaintomlinson.com' 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
