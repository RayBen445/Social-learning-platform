'use server'

import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
} from '@/lib/resend-service'

export async function handleSignUpEmail(
  email: string,
  verificationLink: string,
  verificationCode: string
) {
  try {
    const result = await sendVerificationEmail(email, verificationLink, verificationCode)
    return result
  } catch (error) {
    console.error('[SignUp Email Error]', error)
    return {
      success: false,
      error: 'Failed to send verification email',
    }
  }
}

export async function handleWelcomeEmail(
  email: string,
  userName: string,
  dashboardUrl: string
) {
  try {
    const result = await sendWelcomeEmail(email, userName, dashboardUrl)
    return result
  } catch (error) {
    console.error('[Welcome Email Error]', error)
    return {
      success: false,
      error: 'Failed to send welcome email',
    }
  }
}

export async function handlePasswordResetEmail(email: string, resetLink: string) {
  try {
    const result = await sendPasswordResetEmail(email, resetLink)
    return result
  } catch (error) {
    console.error('[Password Reset Email Error]', error)
    return {
      success: false,
      error: 'Failed to send password reset email',
    }
  }
}
