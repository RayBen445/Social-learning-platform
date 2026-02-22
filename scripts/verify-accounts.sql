-- Verify Bot Account
UPDATE public.profiles 
SET is_verified = true, verification_type = 'bot'
WHERE id IN (SELECT id FROM auth.users WHERE email = 'bot@learnloop.app');

-- Verify Admin Account
UPDATE public.profiles 
SET is_verified = true, verification_type = 'system'
WHERE id IN (SELECT id FROM auth.users WHERE email = 'admin@learnloop.app');

-- Verify Founder Account (You)
UPDATE public.profiles 
SET is_verified = true, verification_type = 'user'
WHERE id IN (SELECT id FROM auth.users WHERE email = 'oladoyeheritage445@gmail.com');

-- Confirm updates
SELECT id, email, is_verified FROM auth.users 
WHERE email IN ('bot@learnloop.app', 'admin@learnloop.app', 'oladoyeheritage445@gmail.com');
