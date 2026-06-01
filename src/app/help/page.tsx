'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  HardHat, CheckCircle2, AlertTriangle, XCircle, ArrowLeft,
  Users, Truck, Shield, Bell, ChevronRight,
} from 'lucide-react';

// ─── Mockups (shown as fallback when screenshot is missing) ──────────────────

function ScreenShot({ src, alt, mockup }: { src: string; alt: string; mockup: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <div className="rounded-xl overflow-hidden border shadow-md bg-white">
      <div className="bg-gray-100 px-3 py-1.5 flex items-center gap-1.5 border-b">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
        <span className="ml-2 text-xs text-gray-400 font-mono truncate">hardhat-xi.vercel.app</span>
      </div>
      <div className="relative">
        <Image
          src={src}
          alt={alt}
          width={900}
          height={500}
          className={loaded ? 'w-full h-auto' : 'hidden'}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          unoptimized
          loading="eager"
        />
        {(!loaded || failed) && (
          <div className="p-4">{mockup}</div>
        )}
      </div>
    </div>
  );
}

function EmployeeListMockup() {
  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-bold text-gray-900">Employees</p>
          <p className="text-xs text-gray-500">3 total</p>
        </div>
        <span className="bg-gray-900 text-white text-xs px-3 py-1.5 rounded-md flex items-center gap-1">
          <span>+</span> Add Employee
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="border rounded-lg p-3">
          <p className="text-xl font-bold text-green-600">1</p>
          <p className="text-xs text-gray-500">Compliant</p>
        </div>
        <div className="border rounded-lg p-3">
          <p className="text-xl font-bold text-yellow-600">1</p>
          <p className="text-xs text-gray-500">Expiring Soon</p>
        </div>
        <div className="border rounded-lg p-3">
          <p className="text-xl font-bold text-red-600">1</p>
          <p className="text-xs text-gray-500">Non-Compliant</p>
        </div>
      </div>
      <div className="border rounded-lg divide-y overflow-hidden">
        {[
          { name: 'John Smith', role: 'Crane Operator', status: 'compliant', statusLabel: 'Compliant', color: 'bg-green-100 text-green-700' },
          { name: 'Maria Garcia', role: 'Electrician', status: 'expiring_soon', statusLabel: 'Expiring Soon', color: 'bg-yellow-100 text-yellow-700' },
          { name: 'Tom Wilson', role: 'Welder', status: 'non_compliant', statusLabel: 'Non-Compliant', color: 'bg-red-100 text-red-700' },
        ].map((e) => (
          <div key={e.name} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
            <div>
              <p className="font-medium text-gray-900 text-sm">{e.name}</p>
              <p className="text-xs text-gray-500">{e.role}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${e.color}`}>{e.statusLabel}</span>
              <ChevronRight className="h-4 w-4 text-gray-300" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AddEmployeeMockup() {
  return (
    <div className="space-y-3 text-sm max-w-md">
      <p className="text-lg font-bold text-gray-900">Add Employee</p>
      <div className="space-y-3">
        {[
          { label: 'Full Name', placeholder: 'John Smith' },
          { label: 'Job Title', placeholder: 'Crane Operator' },
          { label: 'Company', placeholder: 'Acme Construction' },
        ].map((f) => (
          <div key={f.label}>
            <p className="text-xs font-medium text-gray-700 mb-1">{f.label}</p>
            <div className="border rounded-md px-3 py-2 text-xs text-gray-400 bg-gray-50">{f.placeholder}</div>
          </div>
        ))}
        <div className="pt-1">
          <span className="bg-gray-900 text-white text-xs px-4 py-2 rounded-md inline-block">Create Employee</span>
        </div>
      </div>
    </div>
  );
}

function CertFormMockup() {
  return (
    <div className="space-y-3 text-sm">
      <p className="font-bold text-gray-900">Add Certification</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs font-medium text-gray-700 mb-1">Name</p>
          <div className="border rounded-md px-3 py-2 text-xs text-gray-400 bg-gray-50">OSHA 30-Hour</div>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-700 mb-1">Type</p>
          <div className="border rounded-md px-3 py-2 text-xs text-gray-700 bg-white">Certification ▾</div>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-700 mb-1">Issue Date</p>
          <div className="border rounded-md px-3 py-2 text-xs text-gray-400 bg-gray-50">2024-01-15</div>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-700 mb-1">Expiry Date</p>
          <div className="border rounded-md px-3 py-2 text-xs text-gray-400 bg-gray-50">2026-01-15</div>
        </div>
      </div>
      <div className="border rounded-lg overflow-hidden mt-2">
        <div className="bg-gray-50 px-3 py-2 text-xs font-medium text-gray-700 border-b">Existing Certifications</div>
        {[
          { name: 'OSHA 30-Hour', type: 'Certification', status: 'active', color: 'bg-green-100 text-green-700' },
          { name: 'Crane Operator License', type: 'License', status: 'expiring soon', color: 'bg-yellow-100 text-yellow-700' },
          { name: 'Fall Arrest Training', type: 'Task Training', status: 'active', color: 'bg-green-100 text-green-700' },
        ].map((c) => (
          <div key={c.name} className="flex items-center justify-between px-3 py-2 border-b last:border-0">
            <div>
              <p className="text-xs font-medium text-gray-900">{c.name}</p>
              <p className="text-xs text-gray-500">{c.type}</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${c.color}`}>{c.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function QRMockup() {
  return (
    <div className="flex gap-6 items-start">
      <div className="text-center">
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 inline-block">
          <svg viewBox="0 0 80 80" className="w-24 h-24 mx-auto" fill="none">
            <rect x="2" y="2" width="24" height="24" rx="2" fill="black"/>
            <rect x="5" y="5" width="18" height="18" rx="1" fill="white"/>
            <rect x="9" y="9" width="10" height="10" fill="black"/>
            <rect x="54" y="2" width="24" height="24" rx="2" fill="black"/>
            <rect x="57" y="5" width="18" height="18" rx="1" fill="white"/>
            <rect x="61" y="9" width="10" height="10" fill="black"/>
            <rect x="2" y="54" width="24" height="24" rx="2" fill="black"/>
            <rect x="5" y="57" width="18" height="18" rx="1" fill="white"/>
            <rect x="9" y="61" width="10" height="10" fill="black"/>
            <rect x="30" y="2" width="6" height="6" fill="black"/>
            <rect x="40" y="2" width="6" height="6" fill="black"/>
            <rect x="30" y="12" width="6" height="6" fill="black"/>
            <rect x="30" y="30" width="6" height="6" fill="black"/>
            <rect x="40" y="30" width="6" height="6" fill="black"/>
            <rect x="50" y="30" width="6" height="6" fill="black"/>
            <rect x="30" y="40" width="6" height="6" fill="black"/>
            <rect x="54" y="30" width="6" height="6" fill="black"/>
            <rect x="54" y="40" width="6" height="6" fill="black"/>
            <rect x="40" y="54" width="6" height="6" fill="black"/>
            <rect x="54" y="54" width="6" height="6" fill="black"/>
            <rect x="68" y="54" width="6" height="6" fill="black"/>
          </svg>
          <p className="text-xs text-gray-500 mt-2">John Smith</p>
        </div>
        <div className="mt-3">
          <span className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-md">↓ Download QR PNG</span>
        </div>
      </div>
      <div className="text-sm text-gray-600 space-y-2 pt-2">
        <p className="font-medium text-gray-900">Print & attach to:</p>
        <ul className="space-y-1 text-xs">
          <li className="flex items-center gap-2"><span className="w-5 h-5 bg-orange-100 rounded flex items-center justify-center text-orange-600">🪖</span> Hard hat sticker</li>
          <li className="flex items-center gap-2"><span className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center text-blue-600">🪪</span> ID badge</li>
        </ul>
      </div>
    </div>
  );
}

function AddEquipmentMockup() {
  return (
    <div className="space-y-3 text-sm max-w-md">
      <p className="text-lg font-bold text-gray-900">Add Equipment</p>
      <div className="space-y-3">
        {[
          { label: 'Name', placeholder: 'CAT 320 Excavator', hint: 'Make and model' },
          { label: 'Unit ID', placeholder: 'EQ-042', hint: 'Your internal unit number or serial number' },
          { label: 'Job site', placeholder: 'Downtown Tower Project', hint: 'Current site where this equipment is deployed' },
        ].map((f) => (
          <div key={f.label}>
            <p className="text-xs font-medium text-gray-700 mb-1">{f.label}</p>
            <div className="border rounded-md px-3 py-2 text-xs text-gray-400 bg-gray-50">{f.placeholder}</div>
            <p className="text-xs text-gray-400 mt-0.5">{f.hint}</p>
          </div>
        ))}
        <div>
          <p className="text-xs font-medium text-gray-700 mb-1">Type</p>
          <div className="border rounded-md px-3 py-2 text-xs text-gray-500 bg-white flex justify-between">
            <span>Select type...</span><span>▾</span>
          </div>
        </div>
        <div className="pt-1">
          <span className="bg-gray-900 text-white text-xs px-4 py-2 rounded-md inline-block">Create equipment</span>
        </div>
      </div>
    </div>
  );
}

function EquipmentDetailMockup() {
  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-center gap-2">
        <p className="font-bold text-gray-900">Atlas Copco ROC D7 Drill Rig</p>
        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Needs Inspection</span>
      </div>
      <div className="border rounded-lg p-3 space-y-2">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Status Override</p>
        <div className="flex gap-2">
          {['Ready', 'Needs Inspection', 'Out of Service'].map((s) => (
            <span key={s} className={`text-xs px-2 py-1 rounded border ${s === 'Needs Inspection' ? 'bg-gray-900 text-white border-gray-900' : 'text-gray-500 border-gray-200'}`}>{s}</span>
          ))}
        </div>
      </div>
      <div className="border rounded-lg divide-y overflow-hidden">
        <div className="bg-gray-50 px-3 py-2 text-xs font-medium text-gray-700">Documents (3)</div>
        {[
          { name: 'Registration', expiry: 'Expires 7/3/2027', status: 'active', color: 'bg-green-100 text-green-700' },
          { name: 'Insurance', expiry: 'Expires 6/27/2026', status: 'expiring soon', color: 'bg-yellow-100 text-yellow-700' },
          { name: 'Annual Inspection', expiry: 'Expires 11/25/2027', status: 'active', color: 'bg-green-100 text-green-700' },
        ].map((d) => (
          <div key={d.name} className="flex items-center justify-between px-3 py-2">
            <div>
              <p className="text-xs font-medium text-gray-800">{d.name}</p>
              <p className="text-xs text-gray-400">{d.expiry}</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${d.color}`}>{d.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function UserListMockup() {
  const roles = [
    { name: 'Jordan Safety', email: 'estifanos+safetyadmin@live.com', role: 'safety_admin', color: 'bg-blue-100 text-blue-700' },
    { name: 'Carlos Mendez', email: 'estifanos+foreman1@live.com', role: 'foreman', color: 'bg-purple-100 text-purple-700' },
    { name: 'Tony Reyes', email: 'estifanos+mechanic1@live.com', role: 'mechanic', color: 'bg-yellow-100 text-yellow-700' },
    { name: 'James Carter', email: 'estifanos+emp001@live.com', role: 'employee', color: 'bg-gray-100 text-gray-700' },
  ];
  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-center justify-between">
        <p className="text-lg font-bold text-gray-900">User Management</p>
        <span className="bg-gray-900 text-white text-xs px-3 py-1.5 rounded-md">+ Add User</span>
      </div>
      <div className="border rounded-lg divide-y overflow-hidden">
        {roles.map((u) => (
          <div key={u.email} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="font-medium text-gray-900 text-sm">{u.name}</p>
              <p className="text-xs text-gray-400">{u.email}</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.color}`}>{u.role}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScanResultMockup({ status }: { status: 'compliant' | 'expiring_soon' | 'non_compliant' }) {
  const config = {
    compliant: { label: 'COMPLIANT', bg: 'bg-green-500', border: 'border-green-200', light: 'bg-green-50', icon: CheckCircle2, textColor: 'text-green-700' },
    expiring_soon: { label: 'EXPIRING SOON', bg: 'bg-yellow-500', border: 'border-yellow-200', light: 'bg-yellow-50', icon: AlertTriangle, textColor: 'text-yellow-700' },
    non_compliant: { label: 'NON-COMPLIANT', bg: 'bg-red-500', border: 'border-red-200', light: 'bg-red-50', icon: XCircle, textColor: 'text-red-700' },
  }[status];
  const Icon = config.icon;
  return (
    <div className="max-w-xs mx-auto">
      <div className={`${config.bg} text-white text-center py-2 text-sm font-bold flex items-center justify-center gap-2`}>
        <Icon className="h-4 w-4" /> {config.label}
      </div>
      <div className={`${config.light} ${config.border} border-x border-b rounded-b-lg p-4 space-y-3`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border">
            <HardHat className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">John Smith</p>
            <p className="text-xs text-gray-500">Crane Operator · Acme Co.</p>
          </div>
        </div>
        <div className="space-y-1.5">
          {[
            { name: 'OSHA 30-Hour', status: 'active', color: 'bg-green-100 text-green-700' },
            { name: 'Crane License', status: status === 'expiring_soon' ? 'expiring soon' : status === 'non_compliant' ? 'expired' : 'active', color: status === 'compliant' ? 'bg-green-100 text-green-700' : status === 'expiring_soon' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700' },
            { name: 'Fall Arrest', status: 'active', color: 'bg-green-100 text-green-700' },
          ].map((c) => (
            <div key={c.name} className="flex justify-between items-center bg-white rounded px-3 py-1.5 text-xs">
              <span className="text-gray-700">{c.name}</span>
              <span className={`px-2 py-0.5 rounded-full ${c.color}`}>{c.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EquipmentListMockup() {
  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-bold text-gray-900">Equipment</p>
          <p className="text-xs text-gray-500">3 total</p>
        </div>
        <span className="bg-gray-900 text-white text-xs px-3 py-1.5 rounded-md">+ Add Equipment</span>
      </div>
      <div className="border rounded-lg divide-y overflow-hidden">
        {[
          { name: 'Excavator #04', id: 'EXC-004', status: 'Ready', color: 'bg-green-100 text-green-700' },
          { name: 'Crane #12', id: 'CRN-012', status: 'Needs Inspection', color: 'bg-yellow-100 text-yellow-700' },
          { name: 'Forklift #07', id: 'FLT-007', status: 'Out of Service', color: 'bg-red-100 text-red-700' },
        ].map((e) => (
          <div key={e.name} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Truck className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">{e.name}</p>
                <p className="text-xs text-gray-500">{e.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${e.color}`}>{e.status}</span>
              <ChevronRight className="h-4 w-4 text-gray-300" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InspectionMockup() {
  return (
    <div className="space-y-3 text-sm max-w-sm">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <Truck className="h-4 w-4 text-blue-500" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">Excavator #04</p>
          <p className="text-xs text-gray-500">Daily Pre-Use Inspection</p>
        </div>
      </div>
      <div className="border rounded-lg divide-y overflow-hidden">
        {[
          { item: 'Fluid levels checked', checked: true },
          { item: 'Brakes functioning', checked: true },
          { item: 'Lights & signals working', checked: true },
          { item: 'No visible damage', checked: false },
        ].map((c) => (
          <div key={c.item} className="flex items-center gap-3 px-4 py-2.5">
            <div className={`w-4 h-4 rounded flex items-center justify-center ${c.checked ? 'bg-green-500' : 'border border-gray-300'}`}>
              {c.checked && <CheckCircle2 className="h-3 w-3 text-white" />}
            </div>
            <span className="text-xs text-gray-700">{c.item}</span>
          </div>
        ))}
      </div>
      <div>
        <p className="text-xs font-medium text-gray-700 mb-1">Notes</p>
        <div className="border rounded-md px-3 py-2 text-xs text-gray-400 bg-gray-50 h-12">Minor scratch on left panel...</div>
      </div>
      <span className="bg-gray-900 text-white text-xs px-4 py-2 rounded-md inline-block">Submit Inspection</span>
    </div>
  );
}

// ─── Nav helpers ─────────────────────────────────────────────────────────────

function labelToId(label: string): string {
  const overrides: Record<string, string> = {
    'Adding Equipment': 'adding-equipment',
    'Editing Equipment': 'editing-equipment',
  };
  return overrides[label] ?? label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function scrollTo(label: string) {
  const el = document.getElementById(labelToId(label));
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─── Nav items ───────────────────────────────────────────────────────────────

const sections = [
  {
    id: 'admin',
    label: 'Admin Guide',
    icon: Users,
    subsections: ['Getting Started', 'Managing Users', 'Managing Employees', 'Managing Equipment', 'Adding Equipment', 'Editing Equipment', 'Expiration Alerts'],
  },
  {
    id: 'field',
    label: 'Field Worker Guide',
    icon: HardHat,
    subsections: ['Scanning Employee QR', 'Scanning Equipment QR', 'Running Inspections', 'When Something is Red'],
  },
  {
    id: 'status',
    label: 'Status Indicators',
    icon: Shield,
    subsections: ['Employee Status', 'Equipment Status', 'Certification Badges'],
  },
];

// ─── Content sections ────────────────────────────────────────────────────────

function AdminGuide() {
  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Admin Guide</h2>
        <p className="text-gray-500">Manage employees, equipment, and your team from the admin panel.</p>
      </div>

      <section id="getting-started" className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Getting Started</h3>
        <p className="text-sm text-gray-600">
          Sign in at <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-xs">/login</span> with your email and password. Once signed in, you land on your admin dashboard showing total employees, equipment, and any expired or expiring items that need attention.
        </p>
      </section>

      <section id="managing-users" className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Managing Users</h3>
        <div className="space-y-6">
          <div>
            <ScreenShot
              src="/screenshots/admin-users.png"
              alt="User management list"
              mockup={<UserListMockup />}
            />
            <p className="text-xs text-gray-500 mt-2">
              Open <strong>Users</strong> in the top navigation. Only super admins can access this page.
            </p>
          </div>
          <div className="text-sm text-gray-600 space-y-3">
            <p>Click <strong>Add User</strong> to create a new team member. Fill in their full name, email address, a temporary password, and their role.</p>
            <p className="font-medium text-gray-800">Roles and what they can do:</p>
            <div className="space-y-2">
              {[
                { role: 'Super Admin', color: 'bg-orange-100 text-orange-700', desc: 'Full access — manages users, employees, equipment, and all compliance records.' },
                { role: 'Safety Admin', color: 'bg-blue-100 text-blue-700', desc: 'Manages employee certifications and equipment documents. Cannot manage user accounts.' },
                { role: 'Foreman', color: 'bg-purple-100 text-purple-700', desc: 'Reviews crew compliance and equipment status in the field.' },
                { role: 'Mechanic', color: 'bg-yellow-100 text-yellow-700', desc: 'Manages equipment readiness, adds documents, and runs inspections.' },
                { role: 'Employee', color: 'bg-gray-100 text-gray-700', desc: 'Can log in to view their own certifications and compliance status.' },
              ].map(({ role, color, desc }) => (
                <div key={role} className="flex items-start gap-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${color}`}>{role}</span>
                  <p className="text-xs text-gray-600">{desc}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 pt-1">If a user forgets their password, they can use the <strong>Forgot password</strong> link on the sign-in page, or a super admin can reset it from the user list.</p>
          </div>
        </div>
      </section>

      <section id="managing-employees" className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Managing Employees</h3>

        <div className="space-y-6">
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-3">1. The employee list</p>
            <ScreenShot
              src="/screenshots/admin-employees.png"
              alt="Admin employee list"
              mockup={<EmployeeListMockup />}
            />
            <p className="text-xs text-gray-500 mt-2">The employee list shows each worker&apos;s name, job title, company, and compliance status. Summary cards at the top show how many workers are Compliant, Expiring Soon, and Non-Compliant. Use the pagination controls at the bottom to move through larger crews.</p>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-800 mb-3">2. Adding a new employee</p>
            <ScreenShot
              src="/screenshots/admin-add-employee.png"
              alt="Add employee form"
              mockup={<AddEmployeeMockup />}
            />
            <p className="text-xs text-gray-500 mt-2">Go to <strong>Employees → Add Employee</strong>. Enter the full name as it appears on their ID, their job title / role, and the company they belong to. A unique QR code is generated automatically — you can add certifications immediately after.</p>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-800 mb-3">3. Adding certifications & licenses</p>
            <ScreenShot
              src="/screenshots/admin-certifications.png"
              alt="Add certification form"
              mockup={<CertFormMockup />}
            />
            <div className="text-xs text-gray-600 mt-2 space-y-1">
              <p>Open an employee&apos;s detail page and scroll to <strong>Certifications &amp; Licenses</strong>. Use the Add certification form. Choose the type:</p>
              <ul className="ml-4 list-disc space-y-0.5">
                <li><strong>Certification</strong> — e.g. OSHA 30-Hour, First Aid/CPR</li>
                <li><strong>License</strong> — e.g. Crane Operator License (NCCCO), Forklift Operator</li>
                <li><strong>Task Training</strong> — e.g. Lock Out/Tag Out, Fire Watch. Leave expiry blank if there is no expiry date.</li>
              </ul>
              <p className="mt-1">HardHat auto-computes the status from the expiry date. Items expiring within 30 days are automatically flagged as <em>Expiring Soon</em>.</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-800 mb-3">4. Downloading & printing QR codes</p>
            <ScreenShot
              src="/screenshots/admin-qr-download.png"
              alt="QR code download"
              mockup={<QRMockup />}
            />
            <p className="text-xs text-gray-500 mt-2">From the employee detail page, find the <strong>QR Code</strong> section. Click <strong>Preview scan page</strong> to see what a field scan looks like, or <strong>Download QR image</strong> to get a printable PNG. Attach it to the worker&apos;s hard hat or ID badge.</p>
          </div>
        </div>
      </section>

      <section id="managing-equipment" className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Managing Equipment</h3>
        <div className="space-y-6">
          <div id="equipment-list">
            <p className="text-sm font-semibold text-gray-800 mb-3">1. The equipment list</p>
            <ScreenShot
              src="/screenshots/admin-equipment.png"
              alt="Equipment list"
              mockup={<EquipmentListMockup />}
            />
            <p className="text-xs text-gray-500 mt-2">The equipment list shows each machine with its unit ID, job site, and current status. Summary cards at the top show how many items are Ready, Needs Inspection, and Out of Service. Use the pagination controls at the bottom to review additional equipment.</p>
          </div>

          <div id="adding-equipment">
            <p className="text-sm font-semibold text-gray-800 mb-3">2. Adding new equipment</p>
            <ScreenShot
              src="/screenshots/admin-add-equipment.png"
              alt="Add equipment form"
              mockup={<AddEquipmentMockup />}
            />
            <p className="text-xs text-gray-500 mt-2">Click <strong>Add Equipment</strong> and fill in the name (make and model), type, unit ID (your internal number or serial), and the current job site. Click <strong>Create equipment</strong> — a QR code is generated automatically. You can add documents and run inspections immediately after.</p>
          </div>

          <div id="editing-equipment">
            <p className="text-sm font-semibold text-gray-800 mb-3">3. Editing equipment &amp; adding documents</p>
            <ScreenShot
              src="/screenshots/admin-equipment-detail.png"
              alt="Equipment detail page"
              mockup={<EquipmentDetailMockup />}
            />
            <div className="text-xs text-gray-600 mt-2 space-y-1.5">
              <p>Open any piece of equipment to manage it. The detail page has several sections:</p>
              <ul className="ml-4 list-disc space-y-1">
                <li><strong>Equipment details</strong> — edit the name, type, unit ID, and job site, then click Save changes.</li>
                <li><strong>Status override</strong> — HardHat auto-computes status from document expiry dates. Use the override buttons to manually set a machine Out of Service (e.g. due to mechanical failure) even if all documents are current.</li>
                <li><strong>QR Code</strong> — preview or download the QR image to attach to the machine&apos;s dashboard, control panel, or body.</li>
                <li><strong>Documents</strong> — lists registration, insurance, inspection certificates, and any other documents with their expiry dates and status badges. Use the <strong>Add document</strong> form to attach new ones.</li>
                <li><strong>Last Inspection</strong> — shows the most recent inspection result and any notes left by the inspector.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="expiration-alerts" className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Expiration Alerts</h3>
        <div className="flex items-start gap-4 bg-orange-50 border border-orange-200 rounded-xl p-4">
          <Bell className="h-5 w-5 text-orange-500 mt-0.5 shrink-0" />
          <div className="text-sm text-gray-700 space-y-1">
            <p className="font-medium">Daily email alerts are sent automatically.</p>
            <p className="text-xs text-gray-500">All admins receive a daily digest of certifications and equipment documents expiring within 30 days or already expired. Make sure your profile has a valid email address.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function FieldGuide() {
  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Field Worker Guide</h2>
        <p className="text-gray-500">No app needed — just a phone camera and the QR code on the hard hat or equipment.</p>
      </div>

      <section id="scanning-employee-qr" className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Scanning Employee QR Codes</h3>
        <p className="text-sm text-gray-600">Open your phone camera, point it at the QR code on the worker&apos;s hard hat or ID badge, and tap the link that appears. No login required. You&apos;ll see the worker&apos;s name, job title, company, and a status banner. Below that, each certification and license is listed with its type (Cert or License), expiry date, and a green or red icon showing whether it&apos;s current.</p>
        <div className="space-y-6">
          <div className="flex gap-6 items-start">
            <div className="w-48 shrink-0">
              <ScreenShot
                src="/screenshots/14-scan-employee-compliant.png"
                alt="Compliant employee scan result"
                mockup={<ScanResultMockup status="compliant" />}
              />
            </div>
            <div className="pt-1">
              <p className="text-sm font-semibold text-gray-800 mb-2">Compliant — cleared for site</p>
              <p className="text-sm text-gray-500">A green <strong>COMPLIANT</strong> banner means all certifications and licenses are valid. Every item in the Certifications &amp; Licenses list shows a green checkmark with a future expiry date. The worker is cleared to be on site.</p>
            </div>
          </div>
          <div className="flex gap-6 items-start">
            <div className="w-48 shrink-0">
              <ScreenShot
                src="/screenshots/15-scan-employee-expiring-soon.png"
                alt="Expiring soon employee scan result"
                mockup={<ScanResultMockup status="expiring_soon" />}
              />
            </div>
            <div className="pt-1">
              <p className="text-sm font-semibold text-gray-800 mb-2">Expiring soon — action required</p>
              <p className="text-sm text-gray-500">A yellow <strong>EXPIRING SOON</strong> banner means one or more certifications are close to their expiry date. The affected item shows a warning icon and displays how many days remain. The worker can still be on site, but an admin must arrange renewal before the expiry date.</p>
            </div>
          </div>
          <div className="flex gap-6 items-start">
            <div className="w-48 shrink-0">
              <ScreenShot
                src="/screenshots/16-scan-employee-non-compliant.png"
                alt="Non-compliant employee scan result"
                mockup={<ScanResultMockup status="non_compliant" />}
              />
            </div>
            <div className="pt-1">
              <p className="text-sm font-semibold text-gray-800 mb-2">Non-compliant — do not allow on site</p>
              <p className="text-sm text-gray-500">A red <strong>NON-COMPLIANT</strong> banner means at least one certification or license has expired. The expired item shows a red X icon and displays how many days ago it expired. Other valid items still show a green checkmark. The worker must not be on site — contact your admin immediately to resolve the issue before allowing access.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="scanning-equipment-qr" className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Scanning Equipment QR Codes</h3>
        <p className="text-sm text-gray-600">Scan the QR sticker on the equipment — typically on the dashboard, control panel, or body. The page shows the machine name, unit ID, equipment type, and job site location. A status banner appears below the header using the same colour system as employees. The <strong>Documents</strong> section lists each document (registration, insurance, annual inspection) with its expiry date and a status icon. The <strong>Last Inspection</strong> section shows the most recent inspection result, date, inspector name, and any notes. Use the <strong>Start Daily Checklist</strong> button to run a pre-use inspection, or <strong>View Inspection History</strong> to see past results.</p>
        <div className="space-y-6">
          <div className="flex gap-6 items-start">
            <div className="w-48 shrink-0">
              <ScreenShot
                src="/screenshots/17-scan-equipment-ready.png"
                alt="Equipment ready scan result"
                mockup={<EquipmentListMockup />}
              />
            </div>
            <div className="pt-1">
              <p className="text-sm font-semibold text-gray-800 mb-2">Ready — cleared for operation</p>
              <p className="text-sm text-gray-500">A green <strong>READY</strong> banner means all documents are current and the last inspection passed. Every document in the list shows a green checkmark with a valid expiry date. The equipment is safe to operate.</p>
            </div>
          </div>
          <div className="flex gap-6 items-start">
            <div className="w-48 shrink-0">
              <ScreenShot
                src="/screenshots/18-scan-equipment-needs-inspection.png"
                alt="Equipment needs inspection scan result"
                mockup={<EquipmentListMockup />}
              />
            </div>
            <div className="pt-1">
              <p className="text-sm font-semibold text-gray-800 mb-2">Needs inspection — check before use</p>
              <p className="text-sm text-gray-500">A yellow <strong>NEEDS INSPECTION</strong> banner means one or more documents are expiring soon. The affected document shows a warning icon next to its expiry date. The equipment can still be operated, but an admin must renew the document before it expires.</p>
            </div>
          </div>
          <div className="flex gap-6 items-start">
            <div className="w-48 shrink-0">
              <ScreenShot
                src="/screenshots/19-scan-equipment-out-of-service.png"
                alt="Equipment out of service scan result"
                mockup={<EquipmentListMockup />}
              />
            </div>
            <div className="pt-1">
              <p className="text-sm font-semibold text-gray-800 mb-2">Out of service — do not operate</p>
              <p className="text-sm text-gray-500">A red <strong>OUT OF SERVICE</strong> banner means a document has expired or the last inspection failed. The expired document shows a red X icon. If the inspection failed, the Last Inspection section shows a red <strong>Failed</strong> result along with any notes left by the inspector (e.g. damage description). Do not operate the equipment — contact your admin immediately.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="running-inspections" className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Running a Daily Inspection</h3>
        <div>
          <p className="text-sm font-semibold text-gray-800 mb-3">Pre-use inspection checklist</p>
          <ScreenShot
            src="/screenshots/inspection-checklist.png"
            alt="Equipment inspection checklist"
            mockup={<InspectionMockup />}
          />
          <p className="text-xs text-gray-500 mt-2">From the equipment scan page, tap <strong>Start Daily Checklist</strong>. Enter your name, then work through the Pre-Use Checklist — tap the checkmark if an item passes or the X if it fails. Required items are marked with a red asterisk. Add notes for anything that needs attention, and optionally attach photos of damage. Tap <strong>Submit Inspection</strong> when done. The result is logged immediately and visible to anyone who scans the equipment QR code.</p>
        </div>
      </section>

      <section id="when-something-is-red" className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">When Something is Red</h3>
        <div className="flex items-start gap-4 bg-red-50 border border-red-200 rounded-xl p-4">
          <XCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
          <div className="text-sm text-gray-700 space-y-1">
            <p className="font-medium">Do not allow the worker on site or operate the equipment.</p>
            <p className="text-xs text-gray-500">A red status means something has expired. Contact your site admin or supervisor immediately and do not proceed until the issue is resolved.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatusGuide() {
  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Status Indicators</h2>
        <p className="text-gray-500">Every person and piece of equipment has a color-coded status.</p>
      </div>

      <section id="employee-status" className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Employee Status</h3>
        <div className="space-y-3">
          {[
            { Icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50 border-green-200', label: 'Compliant', desc: 'All certifications and licenses are valid and not expiring within 30 days. Worker is cleared for site.' },
            { Icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200', label: 'Expiring Soon', desc: 'One or more certifications expire within 30 days. Worker can still be on site but action is required.' },
            { Icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 border-red-200', label: 'Non-Compliant', desc: 'One or more certifications have expired. Worker should not be on site until resolved.' },
          ].map(({ Icon, color, bg, label, desc }) => (
            <div key={label} className={`flex items-start gap-4 border rounded-xl p-4 ${bg}`}>
              <Icon className={`h-6 w-6 mt-0.5 shrink-0 ${color}`} />
              <div>
                <p className={`font-semibold text-sm ${color}`}>{label}</p>
                <p className="text-sm text-gray-600 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="equipment-status" className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Equipment Status</h3>
        <div className="space-y-3">
          {[
            { Icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50 border-green-200', label: 'Ready', desc: 'All documents are valid. Equipment is cleared for operation.' },
            { Icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200', label: 'Needs Inspection', desc: 'One or more documents expire within 30 days. Equipment can still be operated but admin must act soon.' },
            { Icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 border-red-200', label: 'Out of Service', desc: 'One or more documents have expired. Equipment must not be operated until resolved.' },
          ].map(({ Icon, color, bg, label, desc }) => (
            <div key={label} className={`flex items-start gap-4 border rounded-xl p-4 ${bg}`}>
              <Icon className={`h-6 w-6 mt-0.5 shrink-0 ${color}`} />
              <div>
                <p className={`font-semibold text-sm ${color}`}>{label}</p>
                <p className="text-sm text-gray-600 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="certification-badges" className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Certification Badges</h3>
        <div className="space-y-3">
          {[
            { badge: 'bg-green-100 text-green-700', label: 'active', desc: 'Valid and not expiring within 30 days.' },
            { badge: 'bg-yellow-100 text-yellow-700', label: 'expiring soon', desc: 'Expires within the next 30 days. Renewal required soon.' },
            { badge: 'bg-red-100 text-red-700', label: 'expired', desc: 'Past the expiry date — renewal required before worker can return to site.' },
          ].map(({ badge, label, desc }) => (
            <div key={label} className="flex items-center gap-4 border rounded-xl p-4 bg-white">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${badge} shrink-0`}>{label}</span>
              <p className="text-sm text-gray-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function HelpPage() {
  const [active, setActive] = useState('admin');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 text-sm">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <span className="text-gray-300">|</span>
          <div className="flex items-center gap-2">
            <div className="bg-orange-500 p-1 rounded-md">
              <HardHat className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">HardHat Help</span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 flex gap-8">
        {/* Left sidebar */}
        <aside className="w-56 shrink-0 hidden md:block">
          <nav className="sticky top-20 space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = active === section.id;
              return (
                <div key={section.id}>
                  <button
                    onClick={() => setActive(section.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-orange-50 text-orange-700 border border-orange-200'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {section.label}
                  </button>
                  {isActive && (
                    <div className="ml-4 mt-1 space-y-0.5 border-l border-orange-100 pl-3">
                      {section.subsections.map((sub) => (
                        <button
                          key={sub}
                          onClick={() => scrollTo(sub)}
                          className="block w-full text-left text-xs text-gray-400 py-0.5 hover:text-orange-600 transition-colors"
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Mobile tab strip */}
        <div className="md:hidden w-full mb-6">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActive(section.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
                    active === section.id
                      ? 'bg-orange-50 text-orange-700 border border-orange-200'
                      : 'bg-white text-gray-600 border hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {section.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 min-w-0">
          {active === 'admin' && <AdminGuide />}
          {active === 'field' && <FieldGuide />}
          {active === 'status' && <StatusGuide />}
        </main>
      </div>
    </div>
  );
}
