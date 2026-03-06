'use server'

import { createClient } from '@/lib/supabase/server'
import type { StudentVerificationRecord, VerificationStatus } from '@/lib/student-verification'

/**
 * Create a verification record for a new student
 */
export async function createVerificationRecord(
  userId: string,
  institution: string,
  verificationMethod: 'email' | 'id',
  verificationEmail?: string,
  studentIdUrl?: string
): Promise<StudentVerificationRecord> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('student_verification')
    .insert({
      user_id: userId,
      institution,
      verification_method: verificationMethod,
      verification_email: verificationEmail,
      student_id_url: studentIdUrl,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get verification status for a student
 */
export async function getVerificationStatus(userId: string): Promise<StudentVerificationRecord | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('student_verification')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data
}

/**
 * Update verification status (Admin action)
 */
export async function updateVerificationStatus(
  verificationId: string,
  status: VerificationStatus,
  rejectionReason?: string
): Promise<StudentVerificationRecord> {
  const supabase = await createClient()

  const updateData: Record<string, any> = {
    status,
    updated_at: new Date().toISOString(),
  }

  if (status === 'approved') {
    updateData.verified_at = new Date().toISOString()
  }

  if (rejectionReason) {
    updateData.rejection_reason = rejectionReason
  }

  const { data, error } = await supabase
    .from('student_verification')
    .update(updateData)
    .eq('id', verificationId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Check if user is verified as a student
 */
export async function isStudentVerified(userId: string): Promise<boolean> {
  const verification = await getVerificationStatus(userId)
  return verification?.status === 'approved'
}
