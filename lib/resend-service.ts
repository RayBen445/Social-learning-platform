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
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; 
            line-height: 1.6; 
            color: #1f2937; 
            background: #f3f4f6;
            margin: 0;
            padding: 0;
          }
          .wrapper { background: #f3f4f6; padding: 20px 0; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px; }
          .header p { margin: 8px 0 0 0; opacity: 0.95; font-size: 14px; }
          .content { padding: 40px 30px; }
          .greeting { font-size: 16px; margin-bottom: 20px; }
          .code-section { background: #f9fafb; border: 2px solid #e5e7eb; border-radius: 8px; padding: 24px; text-align: center; margin: 30px 0; }
          .code-label { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
          .code { font-size: 36px; font-weight: 700; letter-spacing: 6px; color: #667eea; font-family: 'Monaco', 'Courier New', monospace; }
          .or-divider { text-align: center; color: #9ca3af; font-size: 13px; margin: 24px 0; }
          .button-wrapper { text-align: center; margin: 30px 0; }
          .button { 
            display: inline-block; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            padding: 14px 40px; 
            text-decoration: none; 
            border-radius: 8px; 
            font-weight: 600;
            font-size: 14px;
            transition: transform 0.2s;
          }
          .button:hover { transform: translateY(-2px); }
          .details { background: #fef3c7; border-left: 4px solid #fbbf24; padding: 16px; border-radius: 4px; margin: 24px 0; font-size: 14px; color: #92400e; }
          .details strong { color: #78350f; }
          .steps { margin: 30px 0; }
          .step { margin-bottom: 16px; display: flex; gap: 12px; }
          .step-number { 
            display: flex; 
            align-items: center; 
            justify-content: center;
            width: 28px; 
            height: 28px; 
            min-width: 28px;
            background: #e0e7ff; 
            color: #667eea; 
            border-radius: 50%; 
            font-weight: 600; 
            font-size: 12px;
          }
          .step-content { flex: 1; }
          .step-content p { margin: 0; font-size: 14px; }
          .step-content strong { color: #1f2937; }
          .step-content .text-muted { color: #6b7280; font-size: 13px; }
          .security-note { 
            background: #dbeafe; 
            border: 1px solid #93c5fd; 
            border-radius: 6px; 
            padding: 12px; 
            margin: 20px 0; 
            font-size: 12px; 
            color: #0c4a6e;
          }
          .footer { 
            background: #f9fafb; 
            border-top: 1px solid #e5e7eb;
            padding: 24px 30px; 
            text-align: center; 
            font-size: 12px; 
            color: #6b7280;
          }
          .footer p { margin: 8px 0; }
          .footer a { color: #667eea; text-decoration: none; }
          .footer a:hover { text-decoration: underline; }
          @media (max-width: 600px) {
            .container { border-radius: 8px; }
            .header { padding: 30px 20px; }
            .header h1 { font-size: 24px; }
            .content { padding: 24px 20px; }
            .code { font-size: 28px; letter-spacing: 4px; }
            .button { padding: 12px 30px; font-size: 14px; }
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <h1>Verify Your Email</h1>
              <p>Welcome to LearnLoop! Let's get you started.</p>
            </div>
            <div class="content">
              <p class="greeting">Hi there,</p>
              <p>Thanks for signing up for LearnLoop! To access your account and start learning, please verify your email address using the code below:</p>
              
              <div class="code-section">
                <div class="code-label">Verification Code</div>
                <div class="code">${verificationCode}</div>
              </div>

              <div class="or-divider">or</div>

              <div class="button-wrapper">
                <a href="${verificationLink}" class="button">Verify Email</a>
              </div>

              <div class="security-note">
                <strong>Security Tip:</strong> Don't share this code with anyone. LearnLoop staff will never ask for it.
              </div>

              <div class="details">
                <strong>⏱️ This code expires in 24 hours</strong>
              </div>

              <h3 style="margin-top: 30px; margin-bottom: 16px; font-size: 16px; color: #1f2937;">Next Steps</h3>
              <div class="steps">
                <div class="step">
                  <div class="step-number">1</div>
                  <div class="step-content">
                    <strong>Paste the code</strong>
                    <p class="text-muted">Or click the link above to auto-verify</p>
                  </div>
                </div>
                <div class="step">
                  <div class="step-number">2</div>
                  <div class="step-content">
                    <strong>Complete setup</strong>
                    <p class="text-muted">Create your profile and start exploring</p>
                  </div>
                </div>
                <div class="step">
                  <div class="step-number">3</div>
                  <div class="step-content">
                    <strong>Join the community</strong>
                    <p class="text-muted">Create posts, connect with students, earn badges</p>
                  </div>
                </div>
              </div>

              <div class="details">
                <strong>📧 Can't find this email?</strong> Check your spam or junk folder. Sometimes our emails end up there by mistake. You can add us to your contacts to prevent this in the future.
              </div>
            </div>
            <div class="footer">
              <p><strong>LearnLoop</strong> • A social learning platform by Cool Shot Systems</p>
              <p><a href="${verificationLink}">Can't click the button? Copy this link:</a></p>
              <p style="word-break: break-all; font-size: 11px; color: #9ca3af;">${verificationLink}</p>
              <p style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                Questions? Visit our <a href="https://learnloop.app/help">Help Center</a>
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `

  const plainText = `Verify Your Email\n\n${verificationCode}\n\nOr visit this link: ${verificationLink}\n\nThis code expires in 24 hours.\n\nIf you didn't sign up for LearnLoop, please ignore this email.\n\n© 2026 LearnLoop by Cool Shot Systems`

  return sendEmail({
    to: email,
    subject: 'Verify Your LearnLoop Email Address',
    html,
    text: plainText,
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
