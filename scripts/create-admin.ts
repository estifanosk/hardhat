import { createClient } from '@supabase/supabase-js';

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
