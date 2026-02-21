#!/usr/bin/env node

/**
 * LearnLoop Admin & Bot Account Setup Helper
 * This script provides secure credentials and instructions for setting up system accounts
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate secure password
function generateSecurePassword() {
  const length = 24;
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  
  // Ensure password has uppercase, lowercase, number, and special character
  password += 'A' + Math.random().toString(36).substring(2, 3).toUpperCase();
  password += 'a' + Math.random().toString(36).substring(2, 3).toLowerCase();
  password += Math.floor(Math.random() * 10).toString();
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)];
  
  // Fill rest of password
  for (let i = password.length; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  // Shuffle password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

// Generate credentials
const botPassword = generateSecurePassword();
const adminPassword = generateSecurePassword();

const credentials = {
  bot: {
    email: 'bot@learnloop.app',
    password: botPassword,
    role: 'Bot',
    description: 'System bot for automated tasks and announcements'
  },
  admin: {
    email: 'admin@learnloop.app',
    password: adminPassword,
    role: 'Administrator',
    description: 'Platform administrator with moderation privileges'
  },
  generatedAt: new Date().toISOString()
};

// Create credentials file
const credentialsPath = path.join(__dirname, '.admin-credentials.json');
fs.writeFileSync(credentialsPath, JSON.stringify(credentials, null, 2), { mode: 0o600 });

// Display credentials and instructions
console.log('\n' + '='.repeat(70));
console.log('🔐 LearnLoop Admin & Bot Account Setup');
console.log('='.repeat(70));

console.log('\n📌 IMPORTANT: Keep these credentials safe and secure!');
console.log('   - Store them in a secure password manager');
console.log('   - Never commit them to version control');
console.log('   - Change passwords after initial setup\n');

console.log('BOT ACCOUNT');
console.log('-'.repeat(70));
console.log(`Email:    ${credentials.bot.email}`);
console.log(`Password: ${credentials.bot.password}`);
console.log(`Role:     ${credentials.bot.role}`);
console.log(`Purpose:  ${credentials.bot.description}\n`);

console.log('ADMIN ACCOUNT');
console.log('-'.repeat(70));
console.log(`Email:    ${credentials.admin.email}`);
console.log(`Password: ${credentials.admin.password}`);
console.log(`Role:     ${credentials.admin.role}`);
console.log(`Purpose:  ${credentials.admin.description}\n`);

console.log('SETUP INSTRUCTIONS');
console.log('-'.repeat(70));
console.log('1. Go to Supabase Dashboard > Authentication');
console.log('2. Click "Add user" button');
console.log('3. For BOT ACCOUNT:');
console.log(`   - Email: ${credentials.bot.email}`);
console.log(`   - Password: ${credentials.bot.password}`);
console.log('   - Auto Confirm: Enable');
console.log('4. For ADMIN ACCOUNT:');
console.log(`   - Email: ${credentials.admin.email}`);
console.log(`   - Password: ${credentials.admin.password}`);
console.log('   - Auto Confirm: Enable');
console.log('5. Copy the user IDs from the auth table');
console.log('6. Update scripts/008_seed_admin_bot_users.sql with the user IDs');
console.log('7. Run the SQL migration to create profiles');
console.log('8. After setup, run: npm run seed-admin-bot\n');

console.log('ENVIRONMENT VARIABLES');
console.log('-'.repeat(70));
console.log('Add these to your .env.local or deployment platform:\n');
console.log(`NEXT_PUBLIC_BOT_EMAIL=${credentials.bot.email}`);
console.log(`BOT_PASSWORD=${credentials.bot.password}`);
console.log(`NEXT_PUBLIC_ADMIN_EMAIL=${credentials.admin.email}`);
console.log(`ADMIN_PASSWORD=${credentials.admin.password}\n`);

console.log('CREDENTIAL FILE SAVED');
console.log('-'.repeat(70));
console.log(`✅ Credentials saved to: ${credentialsPath}`);
console.log('   This file is created with restricted permissions (mode 0o600)\n');

console.log('NEXT STEPS');
console.log('-'.repeat(70));
console.log('1. Create the accounts in Supabase as described above');
console.log('2. Update the SQL migration with user IDs');
console.log('3. Run the migration to set up profiles');
console.log('4. Test login with both accounts');
console.log('5. Verify verification badges appear correctly\n');

console.log('='.repeat(70) + '\n');

export { credentials };
