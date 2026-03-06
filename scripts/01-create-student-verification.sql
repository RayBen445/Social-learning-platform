-- Create student_verification table for tracking verification status
CREATE TABLE IF NOT EXISTS student_verification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  institution TEXT NOT NULL,
  verification_method TEXT NOT NULL CHECK (verification_method IN ('email', 'id')),
  verification_email TEXT,
  student_id_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'unverified')),
  verified_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX idx_student_verification_user_id ON student_verification(user_id);
CREATE INDEX idx_student_verification_status ON student_verification(status);
CREATE INDEX idx_student_verification_created_at ON student_verification(created_at DESC);

-- Add verification_type column to user_profiles if not exists
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('pending', 'approved', 'rejected', 'unverified'));
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS verification_date TIMESTAMP WITH TIME ZONE;
