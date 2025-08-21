import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key from environment
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn('SENDGRID_API_KEY not found in environment variables');
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function sendContactEmail(formData: ContactFormData): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SendGrid API key not configured, skipping SendGrid email');
    return false;
  }

  try {
    // Debug the API key (first 10 chars only for security)
    console.log('SendGrid API Key configured:', process.env.SENDGRID_API_KEY?.substring(0, 10) + '...');
    
    const msg = {
      to: 'contact@romaintomlinson.com', // Your email
      from: 'contact@romaintomlinson.com', // Use your verified sender email
      replyTo: formData.email, // User's email for replies
      subject: `DayFuse Contact Form: ${formData.subject}`,
      text: `
Name: ${formData.name}
Email: ${formData.email}
Subject: ${formData.subject}

Message:
${formData.message}

---
Sent from DayFuse Contact Form
Time: ${new Date().toISOString()}
      `.trim(),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">New Contact Form Submission - DayFuse</h2>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${formData.name}</p>
            <p><strong>Email:</strong> <a href="mailto:${formData.email}">${formData.email}</a></p>
            <p><strong>Subject:</strong> ${formData.subject}</p>
          </div>
          
          <div style="background: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h3 style="margin-top: 0;">Message:</h3>
            <p style="line-height: 1.6; white-space: pre-wrap;">${formData.message}</p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background: #eff6ff; border-radius: 8px; font-size: 14px; color: #374151;">
            <p><strong>Sent from:</strong> DayFuse Contact Form</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Reply to:</strong> <a href="mailto:${formData.email}">${formData.email}</a></p>
          </div>
        </div>
      `
    };

    await sgMail.send(msg);
    console.log('Contact form email sent successfully');
    return true;
  } catch (error) {
    console.error('Failed to send contact email:', error);
    return false;
  }
}

// Send auto-reply to user
export async function sendAutoReply(userEmail: string, userName: string): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    return false;
  }

  try {
    const msg = {
      to: userEmail,
      from: 'noreply@dayfuse.app',
      subject: 'Thank you for contacting DayFuse - We received your message!',
      text: `
Hi ${userName},

Thank you for reaching out to us through the DayFuse contact form!

We've received your message and will get back to you within 24 hours. Our team reviews all inquiries personally to provide you with the best possible assistance.

In the meantime, feel free to explore DayFuse and all its productivity features. If you have any urgent questions, you can also reach us directly at contact@romaintomlinson.com.

Best regards,
The DayFuse Team

---
This is an automated confirmation email.
      `.trim(),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #2563eb, #3b82f6); color: white; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">DayFuse</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Productivity Simplified</p>
          </div>
          
          <div style="padding: 30px; background: #ffffff; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1f2937; margin-top: 0;">Hi ${userName}!</h2>
            
            <p style="line-height: 1.6; color: #374151;">
              Thank you for reaching out to us through the DayFuse contact form!
            </p>
            
            <p style="line-height: 1.6; color: #374151;">
              We've received your message and will get back to you <strong>within 24 hours</strong>. Our team reviews all inquiries personally to provide you with the best possible assistance.
            </p>
            
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
              <p style="margin: 0; color: #1e40af;">
                <strong>💡 Pro Tip:</strong> While you wait, explore all of DayFuse's productivity features including task scheduling, push notifications, and calendar integration!
              </p>
            </div>
            
            <p style="line-height: 1.6; color: #374151;">
              If you have any urgent questions, you can also reach us directly at 
              <a href="mailto:contact@romaintomlinson.com" style="color: #2563eb; text-decoration: none;">contact@romaintomlinson.com</a>.
            </p>
            
            <p style="line-height: 1.6; color: #374151;">
              Best regards,<br>
              <strong>The DayFuse Team</strong>
            </p>
          </div>
          
          <div style="text-align: center; padding: 15px; color: #6b7280; font-size: 12px;">
            This is an automated confirmation email.
          </div>
        </div>
      `
    };

    await sgMail.send(msg);
    console.log('Auto-reply sent successfully');
    return true;
  } catch (error) {
    console.error('Failed to send auto-reply:', error);
    return false;
  }
}