import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Send email using Resend
 */
export async function sendEmail(options: SendEmailOptions): Promise<EmailResult> {
  try {
    const fromEmail = process.env.NEXT_PUBLIC_FROM_EMAIL || 'noreply@learnloop.app'
    const fromName = process.env.NEXT_PUBLIC_FROM_NAME || 'LearnLoop Team'

    const result = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    })

    if (result.error) {
      console.error('[Resend Error]', result.error)
      return {
        success: false,
        error: result.error.message || 'Failed to send email',
      }
    }

    return {
      success: true,
      messageId: result.data?.id,
    }
  } catch (error) {
    console.error('[Resend Exception]', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred while sending email',
    }
  }
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(
  email: string,
  verificationLink: string,
  verificationCode: string
): Promise<EmailResult> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .code-box { background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
          .code { font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #667eea; font-family: 'Courier New', monospace; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { font-size: 12px; color: #999; text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verify Your Email</h1>
          </div>
          <div class="content">
            <p>Welcome to LearnLoop! To complete your signup, please verify your email address.</p>
            
            <div class="code-box">
              <p style="margin: 0 0 10px 0; color: #999; font-size: 14px;">Verification Code</p>
              <div class="code">${verificationCode}</div>
            </div>
            
            <p style="text-align: center;">Or click the button below:</p>
            <div style="text-align: center;">
              <a href="${verificationLink}" class="button">Verify Email Address</a>
            </div>
            
            <p style="font-size: 14px; color: #999;">This link will expire in 24 hours.</p>
            <p style="font-size: 14px; color: #999;">If you didn't create this account, please ignore this email.</p>
            
            <div class="footer">
              <p>© 2026 LearnLoop by Cool Shot Systems. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: 'Verify Your LearnLoop Email Address',
    html,
    text: `Verify your email with code: ${verificationCode}\n\nOr visit: ${verificationLink}`,
  })
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(
  email: string,
  userName: string,
  dashboardUrl: string
): Promise<EmailResult> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .feature-box { background: white; padding: 20px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #667eea; }
          .feature-box strong { color: #667eea; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { font-size: 12px; color: #999; text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to LearnLoop!</h1>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <p>Thank you for joining our community! You're now part of a thriving ecosystem of students and educators passionate about knowledge sharing.</p>
            
            <h3 style="color: #667eea;">Getting Started:</h3>
            <div class="feature-box">
              <strong>Complete Your Profile</strong><br>
              Add a profile picture and bio to help other students get to know you.
            </div>
            <div class="feature-box">
              <strong>Subscribe to Topics</strong><br>
              Follow topics that interest you to see relevant discussions and posts.
            </div>
            <div class="feature-box">
              <strong>Read the Code of Conduct</strong><br>
              Learn about our community guidelines and what makes LearnLoop great.
            </div>
            <div class="feature-box">
              <strong>Start Engaging</strong><br>
              Ask questions, share knowledge, and connect with other learners!
            </div>
            
            <div style="text-align: center;">
              <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
            </div>
            
            <p style="margin-top: 30px;">If you have any questions, check out our Help Center.</p>
            
            <div class="footer">
              <p>© 2026 LearnLoop by Cool Shot Systems. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: `Welcome to LearnLoop, ${userName}!`,
    html,
    text: `Welcome to LearnLoop, ${userName}! Visit your dashboard: ${dashboardUrl}`,
  })
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  resetLink: string
): Promise<EmailResult> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; border-radius: 6px; margin: 20px 0; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { font-size: 12px; color: #999; text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reset Your Password</h1>
          </div>
          <div class="content">
            <p>We received a request to reset your LearnLoop password.</p>
            
            <div style="text-align: center;">
              <a href="${resetLink}" class="button">Reset Password</a>
            </div>
            
            <p style="text-align: center; color: #999; margin-top: 20px;">Or copy and paste this link in your browser:</p>
            <p style="text-align: center; word-break: break-all; font-size: 12px; color: #667eea;"><code>${resetLink}</code></p>
            
            <div class="warning">
              <strong>Security Notice:</strong><br>
              This link will expire in 1 hour for your protection. If you didn't request this password reset, your account is still secure and no changes have been made. Simply ignore this email.
            </div>
            
            <h3 style="color: #667eea;">Password Best Practices:</h3>
            <ul style="color: #666;">
              <li>Use a mix of uppercase and lowercase letters</li>
              <li>Include numbers and special characters</li>
              <li>Make it at least 12 characters long</li>
              <li>Don't reuse old passwords</li>
            </ul>
            
            <div class="footer">
              <p>© 2026 LearnLoop by Cool Shot Systems. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: 'Reset Your LearnLoop Password',
    html,
    text: `Reset your password: ${resetLink}\n\nThis link expires in 1 hour.`,
  })
}
