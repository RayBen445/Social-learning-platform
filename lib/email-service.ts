import fs from 'fs'
import path from 'path'

export type EmailTemplate = 'verify-email' | 'welcome' | 'reset-password'

interface EmailVariables {
  verification_link?: string
  verification_code?: string
  user_name?: string
  reset_link?: string
  dashboard_link?: string
  help_link?: string
  settings_link?: string
  privacy_link?: string
  unsubscribe_link?: string
  support_link?: string
  [key: string]: string | undefined
}

export class EmailService {
  private static templateCache: Map<EmailTemplate, string> = new Map()

  /**
   * Load email template from HTML file
   */
  static loadTemplate(template: EmailTemplate): string {
    if (this.templateCache.has(template)) {
      return this.templateCache.get(template)!
    }

    const templatePath = path.join(process.cwd(), 'emails', `${template}.html`)
    const templateContent = fs.readFileSync(templatePath, 'utf-8')
    this.templateCache.set(template, templateContent)
    return templateContent
  }

  /**
   * Render email template with variables
   */
  static renderTemplate(template: EmailTemplate, variables: EmailVariables): string {
    let content = this.loadTemplate(template)

    // Replace all template variables
    Object.entries(variables).forEach(([key, value]) => {
      if (value) {
        const regex = new RegExp(`{{${key}}}`, 'g')
        content = content.replace(regex, value)
      }
    })

    return content
  }

  /**
   * Generate verification email
   */
  static generateVerificationEmail(
    verificationLink: string,
    verificationCode: string
  ): string {
    return this.renderTemplate('verify-email', {
      verification_link: verificationLink,
      verification_code: verificationCode,
      unsubscribe_link: `${process.env.NEXT_PUBLIC_APP_URL}/email/unsubscribe`,
      privacy_link: `${process.env.NEXT_PUBLIC_APP_URL}/legal/privacy`,
    })
  }

  /**
   * Generate welcome email
   */
  static generateWelcomeEmail(
    userName: string,
    dashboardLink: string
  ): string {
    return this.renderTemplate('welcome', {
      user_name: userName,
      dashboard_link: dashboardLink,
      help_link: `${process.env.NEXT_PUBLIC_APP_URL}/help`,
      settings_link: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
      privacy_link: `${process.env.NEXT_PUBLIC_APP_URL}/legal/privacy`,
    })
  }

  /**
   * Generate password reset email
   */
  static generatePasswordResetEmail(resetLink: string): string {
    return this.renderTemplate('reset-password', {
      reset_link: resetLink,
      support_link: `${process.env.NEXT_PUBLIC_APP_URL}/help`,
      privacy_link: `${process.env.NEXT_PUBLIC_APP_URL}/legal/privacy`,
    })
  }

  /**
   * Get email subject based on template type
   */
  static getEmailSubject(template: EmailTemplate): string {
    const subjects: Record<EmailTemplate, string> = {
      'verify-email': 'Verify Your LearnLoop Email Address',
      'welcome': 'Welcome to LearnLoop!',
      'reset-password': 'Reset Your LearnLoop Password',
    }
    return subjects[template]
  }

  /**
   * Create plain text fallback for email
   */
  static createPlainTextFallback(template: EmailTemplate, variables: EmailVariables): string {
    let text = ''

    switch (template) {
      case 'verify-email':
        text = `Verify Your Email Address\n\nWelcome to LearnLoop! To complete your signup, please verify your email address.\n\n`
        text += `Verification Code: ${variables.verification_code || 'N/A'}\n\n`
        text += `Or visit this link: ${variables.verification_link || 'N/A'}\n\n`
        text += `This link will expire in 24 hours.\n\n`
        text += `If you didn't create this account, please ignore this email.`
        break

      case 'welcome':
        text = `Welcome to LearnLoop, ${variables.user_name}!\n\nThank you for joining our community!\n\n`
        text += `Getting Started:\n`
        text += `- Complete your profile\n`
        text += `- Browse topics and subscribe\n`
        text += `- Read the Code of Conduct\n`
        text += `- Start asking questions and sharing knowledge!\n\n`
        text += `Visit your dashboard: ${variables.dashboard_link || 'N/A'}`
        break

      case 'reset-password':
        text = `Reset Your Password\n\nWe received a request to reset your LearnLoop password.\n\n`
        text += `Click this link to reset: ${variables.reset_link || 'N/A'}\n\n`
        text += `This link expires in 1 hour.\n\n`
        text += `If you didn't request this, you can safely ignore this email.\n`
        text += `Your account is secure - no changes have been made.`
        break
    }

    return text
  }
}

export default EmailService
