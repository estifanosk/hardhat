import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';

function loadLocalEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const sep = trimmed.indexOf('=');
    if (sep === -1) continue;
    const key = trimmed.slice(0, sep).trim();
    let value = trimmed.slice(sep + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] ??= value;
  }
}

loadLocalEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const BASE_EMAIL = 'estifanos';
const EMAIL_DOMAIN = 'live.com';
const PASSWORD = 'TestPass123!';

type Role = 'super_admin' | 'safety_admin' | 'foreman' | 'employee' | 'mechanic' | 'viewer';

interface UserSpec {
  alias: string;
  full_name: string;
  role: Role;
}

const EMPLOYEE_NAMES = [
  'James Carter', 'Maria Lopez', 'David Kim', 'Sarah Johnson', 'Michael Brown',
  'Emily Davis', 'Robert Martinez', 'Jennifer Wilson', 'William Taylor', 'Linda Anderson',
  'Charles Thomas', 'Barbara Jackson', 'Joseph White', 'Patricia Harris', 'Thomas Lewis',
  'Susan Robinson', 'Christopher Walker', 'Karen Hall', 'Daniel Allen', 'Nancy Young',
  'Matthew Hernandez', 'Betty King', 'Anthony Wright', 'Dorothy Scott', 'Mark Green',
  'Sandra Adams', 'Donald Baker', 'Ashley Gonzalez', 'Steven Nelson', 'Kimberly Carter',
  'Paul Mitchell', 'Donna Perez', 'Andrew Roberts', 'Carol Turner', 'Joshua Phillips',
  'Michelle Campbell', 'Kenneth Parker', 'Amanda Evans', 'Kevin Edwards', 'Melissa Collins',
  'Brian Stewart', 'Deborah Sanchez', 'George Morris', 'Stephanie Rogers', 'Edward Reed',
  'Rebecca Cook', 'Ronald Morgan', 'Laura Bell', 'Timothy Murphy', 'Sharon Bailey',
  'Jason Rivera', 'Cynthia Cooper', 'Jeffrey Richardson', 'Angela Cox', 'Ryan Howard',
  'Brenda Ward', 'Jacob Torres', 'Emma Peterson', 'Gary Gray', 'Samantha Ramirez',
  'Nicholas James', 'Christine Watson', 'Eric Brooks', 'Janet Kelly', 'Stephen Sanders',
  'Catherine Price', 'Jonathan Bennett', 'Frances Wood', 'Larry Barnes', 'Ann Ross',
  'Justin Henderson', 'Joyce Coleman', 'Scott Jenkins', 'Evelyn Perry', 'Brandon Powell',
  'Judith Long', 'Benjamin Patterson', 'Martha Hughes', 'Samuel Flores', 'Carolyn Washington',
  'Raymond Butler', 'Marie Simmons', 'Gregory Foster', 'Janet Gonzales', 'Frank Bryant',
  'Alice Alexander', 'Patrick Russell', 'Julie Griffin', 'Dennis Diaz', 'Heather Hayes',
  'Walter Myers', 'Theresa Ford', 'Peter Hamilton', 'Gloria Graham',
];

const users: UserSpec[] = [
  // 1 super_admin test account
  { alias: 'superadmin', full_name: 'Alex Superadmin', role: 'super_admin' },
  // 1 safety_admin
  { alias: 'safetyadmin', full_name: 'Jordan Safety', role: 'safety_admin' },
  // 4 foremen
  { alias: 'foreman1', full_name: 'Carlos Mendez', role: 'foreman' },
  { alias: 'foreman2', full_name: 'Patricia Nguyen', role: 'foreman' },
  { alias: 'foreman3', full_name: 'Derek Sullivan', role: 'foreman' },
  { alias: 'foreman4', full_name: 'Renee Okafor', role: 'foreman' },
  // 2 mechanics
  { alias: 'mechanic1', full_name: 'Tony Reyes', role: 'mechanic' },
  { alias: 'mechanic2', full_name: 'Sandra Kline', role: 'mechanic' },
  // 92 employees
  ...EMPLOYEE_NAMES.map((name, i) => ({
    alias: `emp${String(i + 1).padStart(3, '0')}`,
    full_name: name,
    role: 'employee' as Role,
  })),
];

async function getExistingEmails(): Promise<Set<string>> {
  const emails = new Set<string>();
  let page = 1;
  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) { console.error('Failed to list users:', error.message); break; }
    for (const u of data.users) { if (u.email) emails.add(u.email.toLowerCase()); }
    if (data.users.length < 1000) break;
    page++;
  }
  return emails;
}

async function main() {
  console.log('Fetching existing users...');
  const existing = await getExistingEmails();

  let created = 0;
  let skipped = 0;

  for (const spec of users) {
    const email = `${BASE_EMAIL}+${spec.alias}@${EMAIL_DOMAIN}`;

    if (existing.has(email.toLowerCase())) {
      console.log(`  skip  ${email} (already exists)`);
      skipped++;
      continue;
    }

    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: spec.full_name },
    });

    if (error) {
      console.error(`  ERROR ${email}: ${error.message}`);
      continue;
    }

    const { error: profileError } = await admin.from('profiles').upsert({
      id: data.user.id,
      email,
      full_name: spec.full_name,
      role: spec.role,
    });

    if (profileError) {
      console.error(`  ERROR setting profile for ${email}: ${profileError.message}`);
      continue;
    }

    console.log(`  ✓  ${spec.role.padEnd(12)} ${email}`);
    created++;
  }

  console.log(`\nDone. Created: ${created}, Skipped: ${skipped}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
