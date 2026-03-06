import { createClient } from '@/lib/supabase/server'

export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'unverified'

export interface StudentVerificationRecord {
  id: string
  user_id: string
  institution: string
  verification_method: 'email' | 'id'
  verification_email?: string
  student_id_url?: string
  status: VerificationStatus
  verified_at?: string
  rejection_reason?: string
  created_at: string
  updated_at: string
}

/**
 * Common Nigerian institutional email domains
 * Users must use these email domains for email-based verification
 */
export const INSTITUTIONAL_EMAIL_DOMAINS: Record<string, string[]> = {
  'University of Lagos (UNILAG), Lagos': ['unilag.edu.ng'],
  'Lagos State University (LASU), Ojo': ['lasu.edu.ng'],
  'Pan-Atlantic University, Ibeju-Lekki': ['pau.edu.ng'],
  'Covenant University, Ota': ['covenantuniversity.edu.ng'],
  'Babcock University, Ilishan-Remo': ['babcock.edu.ng'],
  'Redeemer\'s University, Ede': ['run.edu.ng'],
  'Landmark University, Omu-Aran': ['lmu.edu.ng'],
  'University of Ibadan (UI)': ['ui.edu.ng'],
  'Ladoke Akintola University of Technology, Ogbomoso (LAUTECH)': ['lautech.edu.ng'],
  'Lead City University, Ibadan': ['leadcityuniversity.edu.ng'],
  'The Polytechnic, Ibadan': ['polyibadan.edu.ng'],
  'University of Benin (UNIBEN)': ['uniben.edu.ng'],
  'Ambrose Alli University, Ekpoma (AAU)': ['aau.edu.ng'],
  'Benson Idahosa University, Benin City': ['biu.edu.ng'],
  'Igbinedion University, Okada': ['iuokada.edu.ng'],
  'Nnamdi Azikiwe University (UNIZIK), Awka': ['unizik.edu.ng'],
  'Chukwuemeka Odumegwu Ojukwu University (COOU), Anambra': ['coou.edu.ng'],
  'Paul University, Awka': ['pauluniversity.edu.ng'],
  'University of Nigeria, Nsukka (UNN)': ['unn.edu.ng'],
  'Enugu State University of Science & Technology (ESUT)': ['esut.edu.ng'],
  'Godfrey Okoye University, Enugu': ['gouni.edu.ng'],
  'Caritas University, Enugu': ['caritasuni.edu.ng'],
  'Coal City University, Enugu': ['coalcityuniversity.edu.ng'],
  'Ahmadu Bello University, Zaria (ABU)': ['abu.edu.ng'],
  'Kaduna State University (KASU), Kaduna': ['kasu.edu.ng'],
  'Bayero University, Kano (BUK)': ['buk.edu.ng'],
  'Kano University of Science & Technology, Wudil (KUST)': ['kust.edu.ng'],
  'Obafemi Awolowo University, Ile-Ife (OAU)': ['oauife.edu.ng'],
  'Osun State University, Osogbo (UNIOSUN)': ['uniosun.edu.ng'],
  'Adeleke University, Ede': ['adelekeuniversity.edu.ng'],
  'University of Ilorin (UNILORIN)': ['unilorin.edu.ng'],
  'Kwara State University, Malete (KWASU)': ['kwasu.edu.ng'],
  'Al-Hikmah University, Ilorin': ['alhikmah.edu.ng'],
  'Federal University of Technology, Minna (FUTMINNA)': ['futminna.edu.ng'],
  'Ibrahim Badamasi Babangida University, Lapai': ['ibbu.edu.ng'],
  'Niger State University, Minna (NSUK)': ['nsuk.edu.ng'],
  'Federal University of Technology, Akure (FUTA)': ['futa.edu.ng'],
  'Adekunle Ajasin University, Akungba-Akoko (AAUA)': ['aaua.edu.ng'],
  'Ondo State University, Ondo': ['ondosu.edu.ng'],
  'Federal University of Technology, Owerri (FUTO)': ['futo.edu.ng'],
  'Imo State University, Owerri (IMSU)': ['imsu.edu.ng'],
  'Rhema University, Aba': ['rhemauniversity.edu.ng'],
  'University of Calabar (UNICAL)': ['unical.edu.ng'],
  'Cross River University of Technology (CRUTECH), Calabar': ['crutech.edu.ng'],
  'Arthur Jarvis University, Akpabuyo': ['arthurjarvisuniversity.edu.ng'],
  'Delta State University, Abraka (DELSU)': ['delsu.edu.ng'],
  'Federal University of Petroleum Resources, Effurun (FUPRE)': ['fupre.edu.ng'],
  'University of Delta, Agbor': ['unidel.edu.ng'],
  'Rivers State University, Port Harcourt (RSU)': ['rsu.edu.ng'],
  'University of Port Harcourt (UNIPORT)': ['uniport.edu.ng'],
  'Abubakar Tafawa Balewa University (ATBU), Bauchi': ['atbu.edu.ng'],
  'Bauchi State University, Gadau': ['basug.edu.ng'],
  'Federal University of Kashere, Gombe': ['fukashere.edu.ng'],
  'Gombe State University, Gombe': ['gsu.edu.ng'],
  'Modibbo Adama University, Yola': ['maudnigeria.edu.ng'],
  'Adamawa State University, Mubi': ['asu.edu.ng'],
  'American University of Nigeria, Yola': ['aun.edu.ng'],
  'Usmanu Danfodiyo University, Sokoto (UDUS)': ['udus.edu.ng'],
  'Sokoto State University, Sokoto': ['ssu.edu.ng'],
  'University of Maiduguri (UNIMAID)': ['unimaid.edu.ng'],
  'Borno State University, Maiduguri': ['bornosu.edu.ng'],
  'University of Jos (UNIJOS)': ['unijos.edu.ng'],
  'Plateau State University, Bokkos': ['plasu.edu.ng'],
}

/**
 * Validate if email belongs to the selected institution
 */
export function validateInstitutionalEmail(email: string, institution: string): boolean {
  const domains = INSTITUTIONAL_EMAIL_DOMAINS[institution]
  if (!domains) return false

  const emailDomain = email.split('@')[1]?.toLowerCase()
  return domains.some(domain => emailDomain === domain.toLowerCase())
}

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

/**
 * Send verification email (integration with email service)
 */
export async function sendVerificationEmail(
  email: string,
  userName: string,
  institution: string,
  verificationLink: string
): Promise<void> {
  // This would be implemented with Resend or other email service
  console.log(`[Email] Sending verification email to ${email}`)
  console.log(`Verification link: ${verificationLink}`)
}
