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

const [, , email, password, ...nameParts] = process.argv;
const fullName = nameParts.join(' ').trim();

function fail(message: string): never {
  console.error(`Error: ${message}`);
  process.exit(1);
}

if (!email || !password || !fullName) {
  fail('Usage: npm run create-admin -- admin@example.com temporary-password "Full Name"');
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
