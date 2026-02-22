export interface PasswordStrength {
  score: number
  strength: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong'
  feedback: string[]
}

export function checkPasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = []
  let score = 0

  // Length checks
  if (password.length >= 8) score += 20
  else feedback.push('Password should be at least 8 characters')

  if (password.length >= 12) score += 10
  if (password.length >= 16) score += 10

  // Character type checks
  if (/[a-z]/.test(password)) score += 15
  else feedback.push('Add lowercase letters')

  if (/[A-Z]/.test(password)) score += 15
  else feedback.push('Add uppercase letters')

  if (/[0-9]/.test(password)) score += 15
  else feedback.push('Add numbers')

  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 15
  else feedback.push('Add special characters (!@#$%^&*)')

  // Bonus for mixing character types
  const hasLower = /[a-z]/.test(password)
  const hasUpper = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)

  const typeCount = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length
  if (typeCount === 4) score += 10

  // Map score to strength
  let strength: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong'
  if (score < 30) strength = 'weak'
  else if (score < 50) strength = 'fair'
  else if (score < 70) strength = 'good'
  else if (score < 85) strength = 'strong'
  else strength = 'very-strong'

  return { score: Math.min(score, 100), strength, feedback }
}
