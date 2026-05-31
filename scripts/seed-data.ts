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
  console.error('Missing env vars');
  process.exit(1);
}

const db = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── date helpers ────────────────────────────────────────────────────────────

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function daysAgo(days: number): string {
  return daysFromNow(-days);
}

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function qr(prefix: string, tag: string) {
  return `${prefix}-${tag}-${Math.random().toString(36).slice(2, 8)}`;
}

// ── reference data ──────────────────────────────────────────────────────────

const COMPANIES = ['ABC Construction', 'SteelBuild Corp', 'Pacific Contractors', 'Apex Industrial'];

const SITES = [
  'Downtown Tower Project',
  'Bridge Renovation',
  'Highway Extension',
  'Industrial Plant',
  'Warehouse B',
];

const JOB_ROLES = [
  'Crane Operator', 'Welder', 'Electrician', 'Equipment Operator', 'Ironworker',
  'Concrete Finisher', 'Pipefitter', 'Scaffold Builder', 'Safety Officer', 'General Laborer',
];

// ── employee definitions ─────────────────────────────────────────────────────

interface CertSpec {
  name: string;
  type: 'certification' | 'license' | 'task_training';
  issuing_body: string;
  issue_days_ago: number;
  expiry_days_from_now: number | null; // null = no expiry
}

function activeCert(name: string, type: CertSpec['type'], body: string): CertSpec {
  return { name, type, issuing_body: body, issue_days_ago: randomBetween(180, 730), expiry_days_from_now: randomBetween(60, 730) };
}

function expiringSoonCert(name: string, type: CertSpec['type'], body: string): CertSpec {
  return { name, type, issuing_body: body, issue_days_ago: randomBetween(300, 900), expiry_days_from_now: randomBetween(1, 28) };
}

function expiredCert(name: string, type: CertSpec['type'], body: string): CertSpec {
  return { name, type, issuing_body: body, issue_days_ago: randomBetween(400, 1200), expiry_days_from_now: -randomBetween(1, 180) };
}

function noExpiryCert(name: string): CertSpec {
  return { name, type: 'task_training', issuing_body: 'Internal Training', issue_days_ago: randomBetween(30, 365), expiry_days_from_now: null };
}

interface EmployeeSpec {
  name: string;
  role: string;
  company: string;
  site: string;
  certs: CertSpec[];
}

const EMPLOYEES: EmployeeSpec[] = [
  // ── Fully compliant (18) ──────────────────────────────────────────────────
  {
    name: 'James Carter', role: 'Crane Operator', company: 'ABC Construction', site: 'Downtown Tower Project',
    certs: [
      activeCert('OSHA 30-Hour', 'certification', 'OSHA'),
      activeCert('Crane Operator License', 'license', 'NCCCO'),
      activeCert('Rigging Certification', 'certification', 'NCCCO'),
      noExpiryCert('Crane Signals'),
      noExpiryCert('Excavator Operation'),
    ],
  },
  {
    name: 'Maria Lopez', role: 'Foreman', company: 'ABC Construction', site: 'Downtown Tower Project',
    certs: [
      activeCert('OSHA 30-Hour', 'certification', 'OSHA'),
      activeCert('First Aid/CPR', 'certification', 'Red Cross'),
      activeCert('Forklift Operator', 'license', 'OSHA'),
      noExpiryCert('Lock Out/Tag Out'),
    ],
  },
  {
    name: 'David Kim', role: 'Welder', company: 'SteelBuild Corp', site: 'Bridge Renovation',
    certs: [
      activeCert('Welding Certification - AWS D1.1', 'license', 'AWS'),
      activeCert('OSHA 10-Hour', 'certification', 'OSHA'),
      activeCert('Confined Space Entry', 'certification', 'OSHA'),
      noExpiryCert('Fire Watch'),
    ],
  },
  {
    name: 'Sarah Johnson', role: 'Electrician', company: 'Apex Industrial', site: 'Industrial Plant',
    certs: [
      activeCert('Journeyman Electrician License', 'license', 'State Board'),
      activeCert('OSHA 30-Hour', 'certification', 'OSHA'),
      activeCert('Arc Flash Safety', 'certification', 'NFPA'),
      noExpiryCert('Lock Out/Tag Out'),
    ],
  },
  {
    name: 'Michael Brown', role: 'Equipment Operator', company: 'Pacific Contractors', site: 'Highway Extension',
    certs: [
      activeCert('CDL Class A', 'license', 'DMV'),
      activeCert('OSHA 10-Hour', 'certification', 'OSHA'),
      activeCert('Forklift Operator', 'license', 'OSHA'),
      noExpiryCert('Excavator Operation'),
      noExpiryCert('Aerial Work Platform'),
    ],
  },
  {
    name: 'Emily Davis', role: 'Safety Officer', company: 'ABC Construction', site: 'Downtown Tower Project',
    certs: [
      activeCert('OSHA 30-Hour', 'certification', 'OSHA'),
      activeCert('First Aid/CPR', 'certification', 'Red Cross'),
      activeCert('Fall Protection', 'certification', 'OSHA'),
      activeCert('Confined Space Entry', 'certification', 'OSHA'),
    ],
  },
  {
    name: 'Robert Martinez', role: 'Ironworker', company: 'SteelBuild Corp', site: 'Bridge Renovation',
    certs: [
      activeCert('OSHA 10-Hour', 'certification', 'OSHA'),
      activeCert('Fall Protection', 'certification', 'OSHA'),
      activeCert('Rigging Certification', 'certification', 'NCCCO'),
      noExpiryCert('Crane Signals'),
    ],
  },
  {
    name: 'Jennifer Wilson', role: 'Concrete Finisher', company: 'ABC Construction', site: 'Downtown Tower Project',
    certs: [
      activeCert('OSHA 10-Hour', 'certification', 'OSHA'),
      activeCert('First Aid/CPR', 'certification', 'Red Cross'),
      noExpiryCert('Concrete Finishing'),
    ],
  },
  {
    name: 'William Taylor', role: 'Pipefitter', company: 'Apex Industrial', site: 'Industrial Plant',
    certs: [
      activeCert('Pipefitter Journeyman License', 'license', 'UA Local 412'),
      activeCert('OSHA 10-Hour', 'certification', 'OSHA'),
      activeCert('Confined Space Entry', 'certification', 'OSHA'),
      noExpiryCert('Lock Out/Tag Out'),
    ],
  },
  {
    name: 'Linda Anderson', role: 'Scaffold Builder', company: 'Pacific Contractors', site: 'Highway Extension',
    certs: [
      activeCert('OSHA 10-Hour', 'certification', 'OSHA'),
      activeCert('Scaffold Erection', 'certification', 'OSHA'),
      activeCert('Fall Protection', 'certification', 'OSHA'),
    ],
  },
  {
    name: 'Charles Thomas', role: 'Crane Operator', company: 'SteelBuild Corp', site: 'Bridge Renovation',
    certs: [
      activeCert('Crane Operator License', 'license', 'NCCCO'),
      activeCert('OSHA 30-Hour', 'certification', 'OSHA'),
      activeCert('Rigging Certification', 'certification', 'NCCCO'),
      noExpiryCert('Crane Signals'),
    ],
  },
  {
    name: 'Barbara Jackson', role: 'General Laborer', company: 'ABC Construction', site: 'Warehouse B',
    certs: [
      activeCert('OSHA 10-Hour', 'certification', 'OSHA'),
      activeCert('First Aid/CPR', 'certification', 'Red Cross'),
      noExpiryCert('Forklift Operation'),
    ],
  },
  {
    name: 'Joseph White', role: 'Equipment Operator', company: 'Pacific Contractors', site: 'Highway Extension',
    certs: [
      activeCert('CDL Class A', 'license', 'DMV'),
      activeCert('OSHA 10-Hour', 'certification', 'OSHA'),
      noExpiryCert('Excavator Operation'),
      noExpiryCert('Aerial Work Platform'),
    ],
  },
  {
    name: 'Patricia Harris', role: 'Welder', company: 'SteelBuild Corp', site: 'Bridge Renovation',
    certs: [
      activeCert('Welding Certification - AWS D1.5', 'license', 'AWS'),
      activeCert('OSHA 10-Hour', 'certification', 'OSHA'),
      noExpiryCert('Fire Watch'),
    ],
  },
  {
    name: 'Thomas Lewis', role: 'Electrician', company: 'Apex Industrial', site: 'Industrial Plant',
    certs: [
      activeCert('Journeyman Electrician License', 'license', 'State Board'),
      activeCert('OSHA 30-Hour', 'certification', 'OSHA'),
      noExpiryCert('Lock Out/Tag Out'),
    ],
  },
  {
    name: 'Susan Robinson', role: 'Ironworker', company: 'SteelBuild Corp', site: 'Bridge Renovation',
    certs: [
      activeCert('OSHA 10-Hour', 'certification', 'OSHA'),
      activeCert('Fall Protection', 'certification', 'OSHA'),
      noExpiryCert('Crane Signals'),
    ],
  },
  {
    name: 'Christopher Walker', role: 'Safety Officer', company: 'Pacific Contractors', site: 'Highway Extension',
    certs: [
      activeCert('OSHA 30-Hour', 'certification', 'OSHA'),
      activeCert('First Aid/CPR', 'certification', 'Red Cross'),
      activeCert('Fall Protection', 'certification', 'OSHA'),
    ],
  },
  {
    name: 'Karen Hall', role: 'Pipefitter', company: 'Apex Industrial', site: 'Industrial Plant',
    certs: [
      activeCert('Pipefitter Journeyman License', 'license', 'UA Local 412'),
      activeCert('OSHA 10-Hour', 'certification', 'OSHA'),
      noExpiryCert('Lock Out/Tag Out'),
    ],
  },

  // ── Expiring soon (16) ────────────────────────────────────────────────────
  {
    name: 'Daniel Allen', role: 'Crane Operator', company: 'ABC Construction', site: 'Downtown Tower Project',
    certs: [
      activeCert('OSHA 30-Hour', 'certification', 'OSHA'),
      expiringSoonCert('Crane Operator License', 'license', 'NCCCO'),
      activeCert('Rigging Certification', 'certification', 'NCCCO'),
      noExpiryCert('Crane Signals'),
    ],
  },
  {
    name: 'Nancy Young', role: 'Forklift Operator', company: 'ABC Construction', site: 'Warehouse B',
    certs: [
      activeCert('OSHA 10-Hour', 'certification', 'OSHA'),
      expiringSoonCert('Forklift Operator', 'license', 'OSHA'),
      noExpiryCert('Aerial Work Platform'),
    ],
  },
  {
    name: 'Matthew Hernandez', role: 'Welder', company: 'SteelBuild Corp', site: 'Bridge Renovation',
    certs: [
      expiringSoonCert('Welding Certification - AWS D1.1', 'license', 'AWS'),
      activeCert('OSHA 10-Hour', 'certification', 'OSHA'),
      noExpiryCert('Fire Watch'),
    ],
  },
  {
    name: 'Betty King', role: 'Electrician', company: 'Apex Industrial', site: 'Industrial Plant',
    certs: [
      expiringSoonCert('Journeyman Electrician License', 'license', 'State Board'),
      activeCert('OSHA 30-Hour', 'certification', 'OSHA'),
      noExpiryCert('Lock Out/Tag Out'),
    ],
  },
  {
    name: 'Anthony Wright', role: 'Equipment Operator', company: 'Pacific Contractors', site: 'Highway Extension',
    certs: [
      activeCert('CDL Class A', 'license', 'DMV'),
      expiringSoonCert('OSHA 10-Hour', 'certification', 'OSHA'),
      noExpiryCert('Excavator Operation'),
    ],
  },
  {
    name: 'Dorothy Scott', role: 'Scaffold Builder', company: 'Pacific Contractors', site: 'Highway Extension',
    certs: [
      expiringSoonCert('Scaffold Erection', 'certification', 'OSHA'),
      activeCert('OSHA 10-Hour', 'certification', 'OSHA'),
      expiringSoonCert('Fall Protection', 'certification', 'OSHA'),
    ],
  },
  {
    name: 'Mark Green', role: 'Ironworker', company: 'SteelBuild Corp', site: 'Bridge Renovation',
    certs: [
      activeCert('OSHA 10-Hour', 'certification', 'OSHA'),
      expiringSoonCert('Fall Protection', 'certification', 'OSHA'),
      expiringSoonCert('Rigging Certification', 'certification', 'NCCCO'),
    ],
  },
  {
    name: 'Sandra Adams', role: 'Concrete Finisher', company: 'ABC Construction', site: 'Downtown Tower Project',
    certs: [
      expiringSoonCert('OSHA 10-Hour', 'certification', 'OSHA'),
      expiringSoonCert('First Aid/CPR', 'certification', 'Red Cross'),
      noExpiryCert('Concrete Finishing'),
    ],
  },
  {
    name: 'Donald Baker', role: 'Safety Officer', company: 'Apex Industrial', site: 'Industrial Plant',
    certs: [
      activeCert('OSHA 30-Hour', 'certification', 'OSHA'),
      expiringSoonCert('First Aid/CPR', 'certification', 'Red Cross'),
      activeCert('Confined Space Entry', 'certification', 'OSHA'),
    ],
  },
  {
    name: 'Ashley Gonzalez', role: 'Pipefitter', company: 'Apex Industrial', site: 'Industrial Plant',
    certs: [
      expiringSoonCert('Pipefitter Journeyman License', 'license', 'UA Local 412'),
      activeCert('OSHA 10-Hour', 'certification', 'OSHA'),
      noExpiryCert('Lock Out/Tag Out'),
    ],
  },
  {
    name: 'Steven Nelson', role: 'General Laborer', company: 'ABC Construction', site: 'Warehouse B',
    certs: [
      expiringSoonCert('OSHA 10-Hour', 'certification', 'OSHA'),
      noExpiryCert('Forklift Operation'),
    ],
  },
  {
    name: 'Kimberly Carter', role: 'Equipment Operator', company: 'Pacific Contractors', site: 'Highway Extension',
    certs: [
      activeCert('CDL Class A', 'license', 'DMV'),
      expiringSoonCert('Forklift Operator', 'license', 'OSHA'),
      noExpiryCert('Excavator Operation'),
    ],
  },
  {
    name: 'Paul Mitchell', role: 'Crane Operator', company: 'SteelBuild Corp', site: 'Bridge Renovation',
    certs: [
      expiringSoonCert('Crane Operator License', 'license', 'NCCCO'),
      activeCert('OSHA 30-Hour', 'certification', 'OSHA'),
      noExpiryCert('Crane Signals'),
    ],
  },
  {
    name: 'Donna Perez', role: 'Welder', company: 'SteelBuild Corp', site: 'Bridge Renovation',
    certs: [
      activeCert('Welding Certification - AWS D1.5', 'license', 'AWS'),
      expiringSoonCert('OSHA 10-Hour', 'certification', 'OSHA'),
      noExpiryCert('Fire Watch'),
    ],
  },
  {
    name: 'Andrew Roberts', role: 'Electrician', company: 'Apex Industrial', site: 'Industrial Plant',
    certs: [
      activeCert('Journeyman Electrician License', 'license', 'State Board'),
      expiringSoonCert('Arc Flash Safety', 'certification', 'NFPA'),
      noExpiryCert('Lock Out/Tag Out'),
    ],
  },
  {
    name: 'Carol Turner', role: 'Scaffold Builder', company: 'Pacific Contractors', site: 'Highway Extension',
    certs: [
      expiringSoonCert('Scaffold Erection', 'certification', 'OSHA'),
      expiringSoonCert('Fall Protection', 'certification', 'OSHA'),
      noExpiryCert('Aerial Work Platform'),
    ],
  },

  // ── Non-compliant / expired (16) ─────────────────────────────────────────
  {
    name: 'Joshua Phillips', role: 'Equipment Operator', company: 'Pacific Contractors', site: 'Highway Extension',
    certs: [
      expiredCert('OSHA 10-Hour', 'certification', 'OSHA'),
      activeCert('CDL Class A', 'license', 'DMV'),
      noExpiryCert('Excavator Operation'),
    ],
  },
  {
    name: 'Michelle Campbell', role: 'Forklift Operator', company: 'ABC Construction', site: 'Warehouse B',
    certs: [
      expiredCert('Forklift Operator', 'license', 'OSHA'),
      expiredCert('OSHA 10-Hour', 'certification', 'OSHA'),
    ],
  },
  {
    name: 'Kenneth Parker', role: 'Crane Operator', company: 'ABC Construction', site: 'Downtown Tower Project',
    certs: [
      expiredCert('Crane Operator License', 'license', 'NCCCO'),
      activeCert('OSHA 30-Hour', 'certification', 'OSHA'),
      noExpiryCert('Crane Signals'),
    ],
  },
  {
    name: 'Amanda Evans', role: 'Welder', company: 'SteelBuild Corp', site: 'Bridge Renovation',
    certs: [
      expiredCert('Welding Certification - AWS D1.1', 'license', 'AWS'),
      expiredCert('OSHA 10-Hour', 'certification', 'OSHA'),
      noExpiryCert('Fire Watch'),
    ],
  },
  {
    name: 'Kevin Edwards', role: 'Ironworker', company: 'SteelBuild Corp', site: 'Bridge Renovation',
    certs: [
      expiredCert('Fall Protection', 'certification', 'OSHA'),
      activeCert('OSHA 10-Hour', 'certification', 'OSHA'),
      noExpiryCert('Crane Signals'),
    ],
  },
  {
    name: 'Melissa Collins', role: 'Electrician', company: 'Apex Industrial', site: 'Industrial Plant',
    certs: [
      expiredCert('Journeyman Electrician License', 'license', 'State Board'),
      activeCert('OSHA 30-Hour', 'certification', 'OSHA'),
    ],
  },
  {
    name: 'Brian Stewart', role: 'Pipefitter', company: 'Apex Industrial', site: 'Industrial Plant',
    certs: [
      expiredCert('Pipefitter Journeyman License', 'license', 'UA Local 412'),
      expiredCert('Confined Space Entry', 'certification', 'OSHA'),
      noExpiryCert('Lock Out/Tag Out'),
    ],
  },
  {
    name: 'Deborah Sanchez', role: 'Safety Officer', company: 'Pacific Contractors', site: 'Highway Extension',
    certs: [
      activeCert('OSHA 30-Hour', 'certification', 'OSHA'),
      expiredCert('First Aid/CPR', 'certification', 'Red Cross'),
      expiredCert('Fall Protection', 'certification', 'OSHA'),
    ],
  },
  {
    name: 'George Morris', role: 'Equipment Operator', company: 'Pacific Contractors', site: 'Highway Extension',
    certs: [
      expiredCert('CDL Class A', 'license', 'DMV'),
      expiredCert('OSHA 10-Hour', 'certification', 'OSHA'),
      noExpiryCert('Excavator Operation'),
    ],
  },
  {
    name: 'Stephanie Rogers', role: 'Scaffold Builder', company: 'ABC Construction', site: 'Downtown Tower Project',
    certs: [
      expiredCert('Scaffold Erection', 'certification', 'OSHA'),
      expiredCert('Fall Protection', 'certification', 'OSHA'),
    ],
  },
  {
    name: 'Edward Reed', role: 'Concrete Finisher', company: 'ABC Construction', site: 'Warehouse B',
    certs: [
      expiredCert('OSHA 10-Hour', 'certification', 'OSHA'),
      expiredCert('First Aid/CPR', 'certification', 'Red Cross'),
    ],
  },
  {
    name: 'Rebecca Cook', role: 'Crane Operator', company: 'SteelBuild Corp', site: 'Bridge Renovation',
    certs: [
      expiredCert('Crane Operator License', 'license', 'NCCCO'),
      expiredCert('Rigging Certification', 'certification', 'NCCCO'),
      activeCert('OSHA 30-Hour', 'certification', 'OSHA'),
      noExpiryCert('Crane Signals'),
    ],
  },
  {
    name: 'Ronald Morgan', role: 'General Laborer', company: 'ABC Construction', site: 'Warehouse B',
    certs: [
      expiredCert('OSHA 10-Hour', 'certification', 'OSHA'),
    ],
  },
  {
    name: 'Laura Bell', role: 'Welder', company: 'SteelBuild Corp', site: 'Bridge Renovation',
    certs: [
      expiredCert('Welding Certification - AWS D1.5', 'license', 'AWS'),
      activeCert('OSHA 10-Hour', 'certification', 'OSHA'),
      expiredCert('Confined Space Entry', 'certification', 'OSHA'),
    ],
  },
  {
    name: 'Timothy Murphy', role: 'Ironworker', company: 'SteelBuild Corp', site: 'Bridge Renovation',
    certs: [
      expiredCert('Fall Protection', 'certification', 'OSHA'),
      expiredCert('OSHA 10-Hour', 'certification', 'OSHA'),
    ],
  },
  {
    name: 'Sharon Bailey', role: 'Electrician', company: 'Apex Industrial', site: 'Industrial Plant',
    certs: [
      expiredCert('Journeyman Electrician License', 'license', 'State Board'),
      expiredCert('Arc Flash Safety', 'certification', 'NFPA'),
      noExpiryCert('Lock Out/Tag Out'),
    ],
  },
];

// ── equipment definitions ────────────────────────────────────────────────────

interface DocSpec {
  name: string;
  expiry_days_from_now: number | null;
}

interface InspectionSpec {
  inspector_name: string;
  days_ago: number;
  time: string;
  status: 'passed' | 'failed' | 'needs_attention';
  notes?: string;
}

interface EquipmentSpec {
  name: string;
  type: string;
  identifier: string;
  site: string;
  docs: DocSpec[];
  inspections: InspectionSpec[];
}

function activeDoc(name: string): DocSpec { return { name, expiry_days_from_now: randomBetween(60, 730) }; }
function expiringDoc(name: string): DocSpec { return { name, expiry_days_from_now: randomBetween(1, 28) }; }
function expiredDoc(name: string): DocSpec { return { name, expiry_days_from_now: -randomBetween(1, 180) }; }
function noExpiryDoc(name: string): DocSpec { return { name, expiry_days_from_now: null }; }

const EQUIPMENT: EquipmentSpec[] = [
  // ── Ready (10) ────────────────────────────────────────────────────────────
  {
    name: 'CAT 320 Excavator', type: 'Excavator', identifier: 'EQ-001', site: 'Downtown Tower Project',
    docs: [activeDoc('Registration'), activeDoc('Insurance'), activeDoc('Annual Inspection')],
    inspections: [
      { inspector_name: 'Mike Johnson', days_ago: 1, time: '6:45 AM', status: 'passed' },
      { inspector_name: 'Sarah Chen', days_ago: 8, time: '7:00 AM', status: 'passed' },
    ],
  },
  {
    name: 'Komatsu FD50 Forklift', type: 'Forklift', identifier: 'EQ-002', site: 'Warehouse B',
    docs: [activeDoc('Registration'), activeDoc('Insurance'), activeDoc('Annual Inspection')],
    inspections: [
      { inspector_name: 'Tom Brown', days_ago: 2, time: '7:15 AM', status: 'passed' },
    ],
  },
  {
    name: 'Liebherr LTM 1100 Mobile Crane', type: 'Crane', identifier: 'EQ-003', site: 'Downtown Tower Project',
    docs: [activeDoc('Registration'), activeDoc('Insurance'), activeDoc('Annual Inspection'), activeDoc('Load Test Certificate')],
    inspections: [
      { inspector_name: 'James Carter', days_ago: 3, time: '6:30 AM', status: 'passed' },
      { inspector_name: 'James Carter', days_ago: 10, time: '6:30 AM', status: 'passed' },
    ],
  },
  {
    name: 'CAT 950M Loader', type: 'Loader', identifier: 'EQ-004', site: 'Highway Extension',
    docs: [activeDoc('Registration'), activeDoc('Insurance'), activeDoc('Annual Inspection')],
    inspections: [
      { inspector_name: 'Michael Brown', days_ago: 1, time: '7:00 AM', status: 'passed' },
    ],
  },
  {
    name: 'John Deere 850K Dozer', type: 'Bulldozer', identifier: 'EQ-005', site: 'Highway Extension',
    docs: [activeDoc('Registration'), activeDoc('Insurance')],
    inspections: [
      { inspector_name: 'Joseph White', days_ago: 2, time: '7:30 AM', status: 'passed' },
      { inspector_name: 'Joseph White', days_ago: 9, time: '7:30 AM', status: 'passed' },
    ],
  },
  {
    name: 'Ingersoll Rand SD100 Compactor', type: 'Compactor', identifier: 'EQ-006', site: 'Highway Extension',
    docs: [activeDoc('Registration'), activeDoc('Insurance'), activeDoc('Annual Inspection')],
    inspections: [
      { inspector_name: 'Michael Brown', days_ago: 5, time: '8:00 AM', status: 'passed' },
    ],
  },
  {
    name: 'Schwing S 43 SX Concrete Pump', type: 'Concrete Pump', identifier: 'EQ-007', site: 'Downtown Tower Project',
    docs: [activeDoc('Registration'), activeDoc('Insurance'), activeDoc('Annual Inspection')],
    inspections: [
      { inspector_name: 'Jennifer Wilson', days_ago: 4, time: '6:00 AM', status: 'passed' },
    ],
  },
  {
    name: 'Manitowoc MLC165 Crawler Crane', type: 'Crane', identifier: 'EQ-008', site: 'Bridge Renovation',
    docs: [activeDoc('Registration'), activeDoc('Insurance'), activeDoc('Annual Inspection'), activeDoc('Load Test Certificate')],
    inspections: [
      { inspector_name: 'Charles Thomas', days_ago: 1, time: '6:45 AM', status: 'passed' },
    ],
  },
  {
    name: 'Genie S-85 Boom Lift', type: 'Aerial Work Platform', identifier: 'EQ-009', site: 'Industrial Plant',
    docs: [activeDoc('Registration'), activeDoc('Insurance'), activeDoc('Annual Inspection')],
    inspections: [
      { inspector_name: 'Sarah Johnson', days_ago: 3, time: '7:00 AM', status: 'passed' },
    ],
  },
  {
    name: 'Mack Granite Dump Truck', type: 'Dump Truck', identifier: 'EQ-010', site: 'Highway Extension',
    docs: [activeDoc('Registration'), activeDoc('Insurance'), activeDoc('CDL Operating Permit')],
    inspections: [
      { inspector_name: 'George Morris', days_ago: 2, time: '6:30 AM', status: 'passed' },
    ],
  },

  // ── Needs inspection (8 — at least one expiring doc) ─────────────────────
  {
    name: 'CAT 308 Mini Excavator', type: 'Excavator', identifier: 'EQ-011', site: 'Bridge Renovation',
    docs: [activeDoc('Registration'), expiringDoc('Insurance'), activeDoc('Annual Inspection')],
    inspections: [
      { inspector_name: 'David Kim', days_ago: 7, time: '7:00 AM', status: 'needs_attention', notes: 'Track tension slightly low — schedule adjustment' },
      { inspector_name: 'David Kim', days_ago: 14, time: '7:00 AM', status: 'passed' },
    ],
  },
  {
    name: 'Toyota 8FGU25 Forklift', type: 'Forklift', identifier: 'EQ-012', site: 'Warehouse B',
    docs: [expiringDoc('Registration'), activeDoc('Insurance')],
    inspections: [
      { inspector_name: 'Barbara Jackson', days_ago: 3, time: '8:00 AM', status: 'passed' },
    ],
  },
  {
    name: 'Grove RT890E Rough Terrain Crane', type: 'Crane', identifier: 'EQ-013', site: 'Highway Extension',
    docs: [activeDoc('Registration'), expiringDoc('Insurance'), activeDoc('Annual Inspection'), expiringDoc('Load Test Certificate')],
    inspections: [
      { inspector_name: 'Kimberly Carter', days_ago: 6, time: '6:30 AM', status: 'needs_attention', notes: 'Boom hoist cable shows wear — inspection recommended' },
    ],
  },
  {
    name: 'Volvo L90H Wheel Loader', type: 'Loader', identifier: 'EQ-014', site: 'Highway Extension',
    docs: [expiringDoc('Registration'), activeDoc('Insurance')],
    inspections: [
      { inspector_name: 'Anthony Wright', days_ago: 4, time: '7:30 AM', status: 'passed' },
    ],
  },
  {
    name: 'Bomag BW213 Compactor', type: 'Compactor', identifier: 'EQ-015', site: 'Highway Extension',
    docs: [activeDoc('Registration'), expiringDoc('Annual Inspection')],
    inspections: [
      { inspector_name: 'Anthony Wright', days_ago: 2, time: '8:00 AM', status: 'needs_attention', notes: 'Vibration system intermittent — monitor closely' },
    ],
  },
  {
    name: 'JLG 1350SJP Boom Lift', type: 'Aerial Work Platform', identifier: 'EQ-016', site: 'Downtown Tower Project',
    docs: [activeDoc('Registration'), expiringDoc('Insurance'), expiringDoc('Annual Inspection')],
    inspections: [
      { inspector_name: 'Emily Davis', days_ago: 5, time: '7:00 AM', status: 'passed' },
    ],
  },
  {
    name: 'Peterbilt 567 Dump Truck', type: 'Dump Truck', identifier: 'EQ-017', site: 'Highway Extension',
    docs: [expiringDoc('Registration'), activeDoc('Insurance'), expiringDoc('CDL Operating Permit')],
    inspections: [
      { inspector_name: 'Kimberly Carter', days_ago: 1, time: '6:45 AM', status: 'passed' },
    ],
  },
  {
    name: 'Atlas Copco ROC D7 Drill Rig', type: 'Drill Rig', identifier: 'EQ-018', site: 'Bridge Renovation',
    docs: [activeDoc('Registration'), expiringDoc('Insurance'), activeDoc('Annual Inspection')],
    inspections: [
      { inspector_name: 'Mark Green', days_ago: 8, time: '7:15 AM', status: 'needs_attention', notes: 'Drill bit worn — replacement due before next shift' },
    ],
  },

  // ── Out of service (7 — at least one expired doc) ─────────────────────────
  {
    name: 'Terex RT130 Crane', type: 'Crane', identifier: 'EQ-019', site: 'Downtown Tower Project',
    docs: [activeDoc('Registration'), expiredDoc('Insurance'), activeDoc('Annual Inspection'), expiredDoc('Load Test Certificate')],
    inspections: [
      { inspector_name: 'Kenneth Parker', days_ago: 12, time: '6:30 AM', status: 'failed', notes: 'Hydraulic leak detected in main lift cylinder — out of service' },
      { inspector_name: 'Kenneth Parker', days_ago: 19, time: '6:30 AM', status: 'passed' },
    ],
  },
  {
    name: 'Hyster H80FT Forklift', type: 'Forklift', identifier: 'EQ-020', site: 'Industrial Plant',
    docs: [expiredDoc('Registration'), expiredDoc('Insurance')],
    inspections: [
      { inspector_name: 'Sharon Bailey', days_ago: 30, time: '8:00 AM', status: 'failed', notes: 'Mast tilt cylinder leaking — requires immediate repair' },
    ],
  },
  {
    name: 'CAT D6T Bulldozer', type: 'Bulldozer', identifier: 'EQ-021', site: 'Highway Extension',
    docs: [expiredDoc('Annual Inspection'), activeDoc('Registration'), activeDoc('Insurance')],
    inspections: [
      { inspector_name: 'George Morris', days_ago: 45, time: '7:30 AM', status: 'failed', notes: 'Undercarriage track damage — track replacement required' },
    ],
  },
  {
    name: 'Putzmeister M 47-5 Concrete Pump', type: 'Concrete Pump', identifier: 'EQ-022', site: 'Downtown Tower Project',
    docs: [activeDoc('Registration'), expiredDoc('Insurance'), expiredDoc('Annual Inspection')],
    inspections: [
      { inspector_name: 'Michelle Campbell', days_ago: 20, time: '6:00 AM', status: 'failed', notes: 'Boom section 3 cracked — decommissioned pending repair' },
    ],
  },
  {
    name: 'Sandvik DR460i Drill Rig', type: 'Drill Rig', identifier: 'EQ-023', site: 'Bridge Renovation',
    docs: [expiredDoc('Insurance'), activeDoc('Registration')],
    inspections: [
      { inspector_name: 'Timothy Murphy', days_ago: 15, time: '7:00 AM', status: 'failed', notes: 'Engine overheating — cooling system failure' },
    ],
  },
  {
    name: 'Genie Z-135/70 Boom Lift', type: 'Aerial Work Platform', identifier: 'EQ-024', site: 'Industrial Plant',
    docs: [expiredDoc('Annual Inspection'), expiredDoc('Insurance')],
    inspections: [
      { inspector_name: 'Brian Stewart', days_ago: 60, time: '7:00 AM', status: 'failed', notes: 'Platform safety gate latch broken — do not operate' },
    ],
  },
  {
    name: 'Kenworth T880 Dump Truck', type: 'Dump Truck', identifier: 'EQ-025', site: 'Highway Extension',
    docs: [expiredDoc('CDL Operating Permit'), expiredDoc('Registration'), activeDoc('Insurance')],
    inspections: [
      { inspector_name: 'George Morris', days_ago: 25, time: '6:30 AM', status: 'failed', notes: 'Brake system failure — removed from service' },
      { inspector_name: 'George Morris', days_ago: 32, time: '6:30 AM', status: 'needs_attention', notes: 'Brake response slow — flagged for service' },
    ],
  },
];

// ── seed functions ───────────────────────────────────────────────────────────

async function seedEmployees() {
  const { count } = await db.from('employees').select('*', { count: 'exact', head: true });
  if ((count ?? 0) >= EMPLOYEES.length) {
    console.log(`  skip  employees (${count} already exist)`);
    return;
  }

  let empCount = 0;
  let certCount = 0;

  for (const spec of EMPLOYEES) {
    const slug = spec.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const qrCode = qr('emp', slug);

    const { data: emp, error } = await db
      .from('employees')
      .insert({ qr_code: qrCode, name: spec.name, role: spec.role, company: spec.company })
      .select('id')
      .single();

    if (error) { console.error(`  ERROR employee ${spec.name}: ${error.message}`); continue; }

    empCount++;

    const certs = spec.certs.map((c) => ({
      employee_id: emp.id,
      name: c.name,
      type: c.type,
      issuing_body: c.issuing_body,
      issue_date: daysAgo(c.issue_days_ago),
      expiry_date: c.expiry_days_from_now !== null ? daysFromNow(c.expiry_days_from_now) : null,
    }));

    const { error: certError } = await db.from('certifications').insert(certs);
    if (certError) { console.error(`  ERROR certs for ${spec.name}: ${certError.message}`); continue; }

    certCount += certs.length;
  }

  console.log(`  ✓  ${empCount} employees, ${certCount} certifications`);
}

async function seedEquipment() {
  const { count } = await db.from('equipment').select('*', { count: 'exact', head: true });
  if ((count ?? 0) >= EQUIPMENT.length) {
    console.log(`  skip  equipment (${count} already exist)`);
    return;
  }

  let eqCount = 0;
  let docCount = 0;
  let inspCount = 0;

  for (const spec of EQUIPMENT) {
    const qrCode = qr('eq', spec.identifier.toLowerCase().replace(/[^a-z0-9]/g, ''));

    const { data: eq, error } = await db
      .from('equipment')
      .insert({ qr_code: qrCode, name: spec.name, type: spec.type, identifier: spec.identifier, site: spec.site })
      .select('id')
      .single();

    if (error) { console.error(`  ERROR equipment ${spec.name}: ${error.message}`); continue; }

    eqCount++;

    const docs = spec.docs.map((d) => ({
      equipment_id: eq.id,
      name: d.name,
      expiry_date: d.expiry_days_from_now !== null ? daysFromNow(d.expiry_days_from_now) : null,
    }));

    const { error: docError } = await db.from('equipment_documents').insert(docs);
    if (docError) { console.error(`  ERROR docs for ${spec.name}: ${docError.message}`); continue; }
    docCount += docs.length;

    for (const ins of spec.inspections) {
      const { error: insError } = await db.from('inspections').insert({
        equipment_id: eq.id,
        inspector_name: ins.inspector_name,
        inspection_date: daysAgo(ins.days_ago),
        inspection_time: ins.time,
        status: ins.status,
        notes: ins.notes ?? null,
      });
      if (insError) { console.error(`  ERROR inspection for ${spec.name}: ${insError.message}`); continue; }
      inspCount++;
    }
  }

  console.log(`  ✓  ${eqCount} equipment, ${docCount} documents, ${inspCount} inspections`);
}

async function main() {
  console.log('Seeding employees...');
  await seedEmployees();

  console.log('Seeding equipment...');
  await seedEquipment();

  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
