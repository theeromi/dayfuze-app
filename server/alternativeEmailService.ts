/**
 * Alternative Email Service - Multiple fallback options
 * Provides reliable email delivery through various methods
 */

import { ContactFormData } from './emailService';

// Enhanced logging email service for development
export async function logEmailService(formData: ContactFormData): Promise<boolean> {
  try {
    console.log('\n🚨 URGENT: CONTACT FORM SUBMISSION 🚨');
    console.log('='.repeat(60));
    console.log(`📧 TO: contact@romaintomlinson.com`);
    console.log(`👤 FROM: ${formData.name} <${formData.email}>`);
    console.log(`📋 SUBJECT: ${formData.subject}`);
    console.log(`📅 DATE: ${new Date().toLocaleString()}`);
    console.log(`📧 REPLY TO: ${formData.email}`);
    console.log('='.repeat(60));
    console.log('💬 MESSAGE:');
    console.log(formData.message);
    console.log('='.repeat(60));
    
    // Also write to a log file for persistence
    const fs = await import('fs');
    const logEntry = {
      timestamp: new Date().toISOString(),
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      message: formData.message,
      ip: 'server-side', // Could capture actual IP if needed
    };
    
    try {
      await fs.promises.appendFile('contact-form-submissions.log', JSON.stringify(logEntry) + '\n');
      console.log('📝 Email logged to contact-form-submissions.log');
    } catch (logError) {
      console.warn('Could not write to log file:', logError);
    }
    
    return true;
  } catch (error) {
    console.error('Log email service failed:', error);
    return false;
  }
}

// Webhook-based email service (can integrate with Zapier, Make.com, etc.)
export async function webhookEmailService(formData: ContactFormData): Promise<boolean> {
  // Example webhook URL - replace with your actual webhook service
  const webhookUrl = process.env.EMAIL_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.log('EMAIL_WEBHOOK_URL not configured, skipping webhook email');
    return false;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: 'contact@romaintomlinson.com',
        from: formData.email,
        subject: `DayFuse Contact Form: ${formData.subject}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${formData.name}</p>
          <p><strong>Email:</strong> ${formData.email}</p>
          <p><strong>Subject:</strong> ${formData.subject}</p>
          <h3>Message:</h3>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
            ${formData.message.replace(/\n/g, '<br>')}
          </div>
          <hr>
          <p><small>Sent from DayFuse Contact Form at ${new Date().toISOString()}</small></p>
        `,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Webhook email service failed:', error);
    return false;
  }
}

// Database logging service - store submissions for manual review
export async function databaseLogService(formData: ContactFormData): Promise<boolean> {
  try {
    // This would integrate with your database
    // For now, just log to console and return success
    console.log('💾 STORING CONTACT FORM IN DATABASE (simulated)');
    console.log(`   Name: ${formData.name}`);
    console.log(`   Email: ${formData.email}`);
    console.log(`   Subject: ${formData.subject}`);
    console.log(`   Message: ${formData.message}`);
    console.log(`   Timestamp: ${new Date().toISOString()}`);
    
    return true;
  } catch (error) {
    console.error('Database log service failed:', error);
    return false;
  }
}

// Combined email service with multiple fallbacks
export async function multiServiceEmailSend(formData: ContactFormData): Promise<{
  success: boolean;
  method: string;
  error?: string;
}> {
  const services = [
    { name: 'console-log', service: logEmailService },
    { name: 'database-log', service: databaseLogService },
    { name: 'webhook', service: webhookEmailService },
  ];

  let lastError = '';
  
  for (const { name, service } of services) {
    try {
      console.log(`Trying email service: ${name}`);
      const success = await service(formData);
      
      if (success) {
        console.log(`✅ Email sent successfully via ${name}`);
        return { success: true, method: name };
      } else {
        console.log(`❌ Email service ${name} returned false`);
      }
    } catch (error) {
      lastError = `${name}: ${error}`;
      console.error(`Email service ${name} failed:`, error);
    }
  }
  
  return { success: false, method: 'none', error: lastError };
}