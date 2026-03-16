/**
 * Email Service
 * Handles sending emails using nodemailer
 */

import nodemailer from 'nodemailer';
import { env } from '@config/env';
import { logger } from './logger';

// Email configuration
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Create transporter
const createTransporter = () => {
  const config: EmailConfig = {
    host: env.SMTP_HOST || '',
    port: parseInt(env.SMTP_PORT || '587', 10),
    secure: false,
    auth: {
      user: env.SMTP_USER || '',
      pass: env.SMTP_PASS || '',
    },
  };

  // If SMTP is not configured, return null
  if (!config.host || !config.auth.user) {
    logger.warn('SMTP not configured. Emails will be logged but not sent.');
    return null;
  }

  return nodemailer.createTransporter(config);
};

const transporter = createTransporter();

// Send email helper
const sendEmail = async ({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<void> => {
  try {
    const fromEmail = env.FROM_EMAIL || 'noreply@dynamicmenu.io';

    if (!transporter) {
      // Log email for development when SMTP is not configured
      logger.info('Email would be sent (SMTP not configured):', {
        to,
        from: fromEmail,
        subject,
      });
      return;
    }

    await transporter.sendMail({
      from: `"DynamicMenu" <${fromEmail}>`,
      to,
      subject,
      text,
      html,
    });

    logger.info('Email sent successfully', { to, subject });
  } catch (error) {
    logger.error('Failed to send email', { error, to, subject });
    // Don't throw - email failures should not break the application
  }
};

// Welcome email template
const getWelcomeEmailTemplate = (
  userName: string,
  restaurantName: string,
  dashboardUrl: string
): { html: string; text: string } => {
  const currentYear = new Date().getFullYear();

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to DynamicMenu</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      background-color: #f8f9fa; 
      color: #333;
      line-height: 1.6;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background-color: #ffffff;
    }
    .header { 
      background: linear-gradient(135deg, #FF6B35 0%, #FF8F5C 100%);
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 { 
      color: #ffffff; 
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 10px;
    }
    .header p {
      color: rgba(255,255,255,0.9);
      font-size: 16px;
    }
    .content { 
      padding: 40px 30px;
    }
    .welcome-message {
      font-size: 20px;
      color: #1a1a1a;
      margin-bottom: 20px;
    }
    .restaurant-name {
      color: #FF6B35;
      font-weight: 700;
    }
    .section {
      margin: 30px 0;
      padding: 25px;
      background-color: #f8f9fa;
      border-radius: 12px;
      border-left: 4px solid #FF6B35;
    }
    .section h2 {
      font-size: 18px;
      color: #1a1a1a;
      margin-bottom: 15px;
    }
    .section ul {
      list-style: none;
      padding: 0;
    }
    .section li {
      padding: 10px 0;
      padding-left: 30px;
      position: relative;
    }
    .section li:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #16A34A;
      font-weight: bold;
      font-size: 18px;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #FF6B35 0%, #FF8F5C 100%);
      color: #ffffff !important;
      text-decoration: none;
      padding: 16px 40px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      margin: 30px 0;
      text-align: center;
    }
    .cta-container {
      text-align: center;
    }
    .features-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-top: 20px;
    }
    .feature-item {
      text-align: center;
      padding: 20px;
      background-color: #ffffff;
      border-radius: 8px;
    }
    .feature-icon {
      font-size: 32px;
      margin-bottom: 10px;
    }
    .feature-title {
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 5px;
    }
    .feature-desc {
      font-size: 14px;
      color: #666;
    }
    .support-section {
      text-align: center;
      padding: 30px;
      background-color: #f8f9fa;
      margin-top: 30px;
    }
    .support-section h3 {
      font-size: 18px;
      margin-bottom: 10px;
    }
    .support-section a {
      color: #FF6B35;
      text-decoration: none;
    }
    .footer { 
      background-color: #1a1a1a;
      color: #999;
      padding: 30px;
      text-align: center;
      font-size: 14px;
    }
    .footer a {
      color: #FF6B35;
      text-decoration: none;
    }
    @media (max-width: 600px) {
      .features-grid {
        grid-template-columns: 1fr;
      }
      .content {
        padding: 30px 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🍽️ DynamicMenu</h1>
      <p>Your Digital Menu Solution</p>
    </div>
    
    <div class="content">
      <p class="welcome-message">Hello <strong>${userName}</strong>,</p>
      
      <p>Welcome to DynamicMenu! We're thrilled to have you on board. Your restaurant <strong class="restaurant-name">${restaurantName}</strong> is now set up and ready to go.</p>
      
      <div class="section">
        <h2>🚀 Quick Start Guide</h2>
        <ul>
          <li>Customize your menu with categories and items</li>
          <li>Upload your restaurant logo and set brand colors</li>
          <li>Generate QR codes for tables and areas</li>
          <li>Publish your menu and start accepting orders</li>
        </ul>
      </div>
      
      <div class="cta-container">
        <a href="${dashboardUrl}" class="cta-button">Go to Your Dashboard</a>
      </div>
      
      <div class="features-grid">
        <div class="feature-item">
          <div class="feature-icon">📱</div>
          <div class="feature-title">QR Code Menus</div>
          <div class="feature-desc">Unlimited QR codes for all your tables</div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">🎨</div>
          <div class="feature-title">Custom Branding</div>
          <div class="feature-desc">Match your restaurant's unique style</div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">📊</div>
          <div class="feature-title">Analytics</div>
          <div class="feature-desc">Track views and customer engagement</div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">🌍</div>
          <div class="feature-title">Multi-language</div>
          <div class="feature-desc">Support for multiple languages</div>
        </div>
      </div>
      
      <div class="support-section">
        <h3>Need Help?</h3>
        <p>Our support team is here to assist you.</p>
        <p>Email us at <a href="mailto:support@dynamicmenu.io">support@dynamicmenu.io</a></p>
      </div>
    </div>
    
    <div class="footer">
      <p>© ${currentYear} DynamicMenu. All rights reserved.</p>
      <p style="margin-top: 10px;">
        You're receiving this email because you signed up for DynamicMenu.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Welcome to DynamicMenu, ${userName}!

Your restaurant "${restaurantName}" is now set up and ready to go.

QUICK START GUIDE:
• Customize your menu with categories and items
• Upload your restaurant logo and set brand colors
• Generate QR codes for tables and areas
• Publish your menu and start accepting orders

Go to your dashboard: ${dashboardUrl}

FEATURES INCLUDED IN YOUR FREE PLAN:
• 1 Restaurant
• Unlimited menu items
• Unlimited QR codes
• Custom branding
• Basic analytics

Need Help?
Our support team is here to assist you.
Email us at support@dynamicmenu.io

© ${currentYear} DynamicMenu. All rights reserved.
  `;

  return { html, text };
};

// Send welcome email
export const sendWelcomeEmail = async (
  userEmail: string,
  userName: string,
  restaurantName: string
): Promise<void> => {
  const dashboardUrl = env.FRONTEND_URL || 'http://localhost:5173';
  const { html, text } = getWelcomeEmailTemplate(userName, restaurantName, dashboardUrl);

  await sendEmail({
    to: userEmail,
    subject: `Welcome to DynamicMenu, ${userName}! 🍽️`,
    html,
    text,
  });
};

// Test email configuration
export const testEmailConnection = async (): Promise<boolean> => {
  if (!transporter) {
    logger.warn('Email transporter not configured');
    return false;
  }

  try {
    await transporter.verify();
    logger.info('Email server connection verified');
    return true;
  } catch (error) {
    logger.error('Email server connection failed', { error });
    return false;
  }
};

export default {
  sendWelcomeEmail,
  testEmailConnection,
};
