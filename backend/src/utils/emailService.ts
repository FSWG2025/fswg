/**
 * Email Service Utility
 * Placeholder for email integration (Resend, SendGrid, AWS SES, etc.)
 * 
 * TODO: Integrate with your preferred email provider
 * Example: npm install resend
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

/**
 * Send email (placeholder - implement with your email provider)
 */
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    const {
      to,
      subject,
      html,
      from = process.env.EMAIL_FROM || "hello@firststepwealth.ca",
      cc,
      bcc,
      attachments,
    } = options;

    console.log("📧 Email would be sent:");
    console.log(`   From: ${from}`);
    console.log(`   To: ${to}`);
    console.log(`   Subject: ${subject}`);

    // TODO: Implement with your email provider
    // Example with Resend:
    // import { Resend } from 'resend';
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from,
    //   to,
    //   subject,
    //   html,
    //   cc,
    //   bcc,
    //   attachments,
    // });

    return true;
  } catch (error) {
    console.error("❌ Failed to send email:", (error as Error).message);
    return false;
  }
};

/**
 * Send welcome email
 */
export const sendWelcomeEmail = async (
  email: string,
  name: string
): Promise<boolean> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #12213E; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { 
          display: inline-block; 
          background: #C69259; 
          color: white; 
          padding: 12px 30px; 
          text-decoration: none; 
          border-radius: 25px; 
          font-weight: bold; 
          margin: 20px 0; 
        }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to First Step Wealth Group! 🎉</h1>
        </div>
        <div class="content">
          <h2>Hi ${name},</h2>
          <p>Thank you for joining First Step Wealth Group. We're excited to help you on your journey to financial freedom.</p>
          <p>Here's what you can do next:</p>
          <ul>
            <li>📅 Book your free consultation</li>
            <li>📚 Explore our financial education resources</li>
            <li>🏠 Apply for rental support</li>
            <li>🛡️ Get insurance coverage</li>
          </ul>
          <a href="${process.env.CLIENT_URL}/dashboard" class="button">Go to Dashboard</a>
          <p>If you have any questions, just reply to this email.</p>
          <p>Best regards,<br>The First Step Wealth Group Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} First Step Wealth Group. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: email,
    subject: "Welcome to First Step Wealth Group! 🎉",
    html,
  });
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string
): Promise<boolean> => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #12213E; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { 
          display: inline-block; 
          background: #C69259; 
          color: white; 
          padding: 12px 30px; 
          text-decoration: none; 
          border-radius: 25px; 
          font-weight: bold; 
          margin: 20px 0; 
        }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Reset Your Password 🔐</h1>
        </div>
        <div class="content">
          <h2>Password Reset Request</h2>
          <p>You requested a password reset. Click the button below to reset your password.</p>
          <p>This link will expire in 30 minutes.</p>
          <a href="${resetUrl}" class="button">Reset Password</a>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Best regards,<br>The First Step Wealth Group Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} First Step Wealth Group. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: email,
    subject: "Reset Your Password - First Step Wealth Group",
    html,
  });
};

/**
 * Send consultation confirmation email
 */
export const sendConsultationConfirmation = async (
  email: string,
  name: string,
  dateTime: Date,
  consultantName: string
): Promise<boolean> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #12213E; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .details { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Consultation Confirmed! 📅</h1>
        </div>
        <div class="content">
          <h2>Hi ${name},</h2>
          <p>Your consultation has been confirmed. Here are the details:</p>
          <div class="details">
            <p><strong>Date:</strong> ${new Date(dateTime).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}</p>
            <p><strong>Time:</strong> ${new Date(dateTime).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}</p>
            <p><strong>Consultant:</strong> ${consultantName}</p>
          </div>
          <p>We look forward to speaking with you!</p>
          <p>Best regards,<br>The First Step Wealth Group Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} First Step Wealth Group. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: email,
    subject: "Consultation Confirmed - First Step Wealth Group",
    html,
  });
};