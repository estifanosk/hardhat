import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';

function loadLocalEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separator = trimmed.indexOf('=');
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] ??= value;
  }
}

loadLocalEnv();

function fail(message: string): never {
  console.error(`Error: ${message}`);
  process.exit(1);
}

function readFlag(name: string) {
  const index = process.argv.indexOf(name);
  if (index === -1) return null;

  const value = process.argv[index + 1];
  if (!value || value.startsWith('--')) {
    fail(`Missing value for ${name}.`);
  }

  return value;
}

const email = readFlag('--email');
const password = readFlag('--password');
const fullName = readFlag('--name');

if (!email || !password || !fullName) {
  fail('Usage: npm run create-admin -- --email admin@example.com --password temporary-password --name "Full Name"');
}

if (!email.includes('@')) {
  fail('Email must look like an email address.');
}

if (password.length < 8) {
  fail('Password must be at least 8 characters.');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  fail('NEXT_PUBLIC_SUPABASE_URL is not set.');
}

if (!serviceRoleKey) {
  fail('SUPABASE_SERVICE_ROLE_KEY is not set.');
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function main() {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (error) {
    fail(error.message);
  }

  if (!data.user) {
    fail('Supabase did not return a created user.');
  }

  const { error: profileError } = await admin.from('profiles').upsert({
    id: data.user.id,
    email,
    full_name: fullName,
    role: 'super_admin',
  });

  if (profileError) {
    fail(profileError.message);
  }

  console.log(`Created super admin: ${email}`);
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : String(error));
});
