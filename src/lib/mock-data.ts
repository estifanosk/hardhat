// Mock data for HardHat POC

export interface Certification {
  id: string;
  name: string;
  type: 'certification' | 'license' | 'task_training';
  issuingBody?: string;
  issueDate: string;
  expiryDate: string | null;
  status: 'active' | 'expiring_soon' | 'expired';
}

export interface Employee {
  id: string;
  qrCode: string;
  name: string;
  role: string;
  company: string;
  photoUrl: string;
  certifications: Certification[];
  overallStatus: 'compliant' | 'expiring_soon' | 'non_compliant';
}

export interface EquipmentDocument {
  id: string;
  name: string;
  expiryDate: string | null;
  status: 'active' | 'expiring_soon' | 'expired';
}

export interface Inspection {
  id: string;
  date: string;
  time: string;
  inspectorName: string;
  status: 'passed' | 'failed' | 'needs_attention';
  notes?: string;
}

export interface Equipment {
  id: string;
  qrCode: string;
  name: string;
  type: string;
  identifier: string;
  site: string;
  photoUrl: string;
  documents: EquipmentDocument[];
  lastInspection: Inspection | null;
  overallStatus: 'ready' | 'needs_inspection' | 'out_of_service';
}

export interface ChecklistItem {
  id: string;
  label: string;
  required: boolean;
}

export interface JHAHazard {
  id: string;
  hazard: string;
  mitigation: string;
}

export interface JHAForm {
  id: string;
  siteName: string;
  date: string;
  foremanName: string;
  hazards: JHAHazard[];
  crewMembers: { id: string; name: string; signed: boolean; signedAt?: string }[];
}

// Mock Employees
export const employees: Employee[] = [
  {
    id: '1',
    qrCode: 'emp-abc123',
    name: 'John Smith',
    role: 'Crane Operator',
    company: 'ABC Construction',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    certifications: [
      {
        id: 'c1',
        name: 'OSHA 30-Hour',
        type: 'certification',
        issuingBody: 'OSHA',
        issueDate: '2023-08-15',
        expiryDate: '2026-08-15',
        status: 'active',
      },
      {
        id: 'c2',
        name: 'Crane Operator License',
        type: 'license',
        issuingBody: 'NCCCO',
        issueDate: '2024-01-10',
        expiryDate: '2025-12-01',
        status: 'active',
      },
      {
        id: 'c3',
        name: 'Rigging Certification',
        type: 'certification',
        issuingBody: 'NCCCO',
        issueDate: '2023-06-20',
        expiryDate: '2025-06-10',
        status: 'expiring_soon',
      },
      {
        id: 'c4',
        name: 'Excavator',
        type: 'task_training',
        issuingBody: 'ABC Construction',
        issueDate: '2024-03-01',
        expiryDate: null,
        status: 'active',
      },
      {
        id: 'c5',
        name: 'Crane Signals',
        type: 'task_training',
        issuingBody: 'ABC Construction',
        issueDate: '2024-02-15',
        expiryDate: null,
        status: 'active',
      },
    ],
    overallStatus: 'expiring_soon',
  },
  {
    id: '2',
    qrCode: 'emp-def456',
    name: 'Maria Garcia',
    role: 'Foreman',
    company: 'ABC Construction',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    certifications: [
      {
        id: 'c6',
        name: 'OSHA 30-Hour',
        type: 'certification',
        issuingBody: 'OSHA',
        issueDate: '2024-02-20',
        expiryDate: '2027-02-20',
        status: 'active',
      },
      {
        id: 'c7',
        name: 'First Aid/CPR',
        type: 'certification',
        issuingBody: 'Red Cross',
        issueDate: '2024-06-01',
        expiryDate: '2026-06-01',
        status: 'active',
      },
      {
        id: 'c8',
        name: 'Forklift Operator',
        type: 'license',
        issuingBody: 'OSHA',
        issueDate: '2023-09-15',
        expiryDate: '2026-09-15',
        status: 'active',
      },
    ],
    overallStatus: 'compliant',
  },
  {
    id: '3',
    qrCode: 'emp-ghi789',
    name: 'Mike Wilson',
    role: 'Equipment Operator',
    company: 'ABC Construction',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    certifications: [
      {
        id: 'c9',
        name: 'OSHA 10-Hour',
        type: 'certification',
        issuingBody: 'OSHA',
        issueDate: '2022-05-10',
        expiryDate: '2025-05-10',
        status: 'expired',
      },
      {
        id: 'c10',
        name: 'Forklift License',
        type: 'license',
        issuingBody: 'OSHA',
        issueDate: '2022-03-01',
        expiryDate: '2025-03-01',
        status: 'expired',
      },
    ],
    overallStatus: 'non_compliant',
  },
];

// Mock Equipment
export const equipment: Equipment[] = [
  {
    id: '1',
    qrCode: 'eq-xyz001',
    name: 'CAT 320 Excavator',
    type: 'Excavator',
    identifier: 'EQ-042',
    site: 'Downtown Tower Project',
    photoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&h=200&fit=crop',
    documents: [
      {
        id: 'd1',
        name: 'Registration',
        expiryDate: '2026-03-20',
        status: 'active',
      },
      {
        id: 'd2',
        name: 'Insurance',
        expiryDate: '2026-01-15',
        status: 'active',
      },
      {
        id: 'd3',
        name: 'Annual Inspection',
        expiryDate: '2025-11-30',
        status: 'active',
      },
    ],
    lastInspection: {
      id: 'i1',
      date: new Date().toISOString().split('T')[0],
      time: '6:45 AM',
      inspectorName: 'Mike Johnson',
      status: 'passed',
    },
    overallStatus: 'ready',
  },
  {
    id: '2',
    qrCode: 'eq-xyz002',
    name: 'Komatsu Forklift',
    type: 'Forklift',
    identifier: 'EQ-018',
    site: 'Warehouse B',
    photoUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=300&h=200&fit=crop',
    documents: [
      {
        id: 'd4',
        name: 'Registration',
        expiryDate: '2025-08-15',
        status: 'active',
      },
      {
        id: 'd5',
        name: 'Insurance',
        expiryDate: '2025-06-20',
        status: 'expiring_soon',
      },
    ],
    lastInspection: {
      id: 'i2',
      date: new Date().toISOString().split('T')[0],
      time: '7:02 AM',
      inspectorName: 'Sarah Chen',
      status: 'passed',
    },
    overallStatus: 'ready',
  },
  {
    id: '3',
    qrCode: 'eq-xyz003',
    name: 'Liebherr Mobile Crane',
    type: 'Crane',
    identifier: 'EQ-033',
    site: 'Downtown Tower Project',
    photoUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300&h=200&fit=crop',
    documents: [
      {
        id: 'd6',
        name: 'Registration',
        expiryDate: '2025-12-01',
        status: 'active',
      },
      {
        id: 'd7',
        name: 'Insurance',
        expiryDate: '2025-04-30',
        status: 'expired',
      },
      {
        id: 'd8',
        name: 'Load Test Certificate',
        expiryDate: '2025-09-15',
        status: 'active',
      },
    ],
    lastInspection: {
      id: 'i3',
      date: new Date().toISOString().split('T')[0],
      time: '7:15 AM',
      inspectorName: 'Tom Brown',
      status: 'failed',
      notes: 'Hydraulic leak detected',
    },
    overallStatus: 'out_of_service',
  },
  {
    id: '4',
    qrCode: 'eq-xyz004',
    name: 'CAT 950 Loader',
    type: 'Loader',
    identifier: 'EQ-007',
    site: 'Highway Extension',
    photoUrl: 'https://images.unsplash.com/photo-1579633007747-e87e4d58d82c?w=300&h=200&fit=crop',
    documents: [
      {
        id: 'd9',
        name: 'Registration',
        expiryDate: '2026-02-28',
        status: 'active',
      },
      {
        id: 'd10',
        name: 'Insurance',
        expiryDate: '2026-02-28',
        status: 'active',
      },
    ],
    lastInspection: null,
    overallStatus: 'needs_inspection',
  },
];

// Equipment checklist template
export const excavatorChecklist: ChecklistItem[] = [
  { id: 'ch1', label: 'Engine oil level', required: true },
  { id: 'ch2', label: 'Hydraulic fluid level', required: true },
  { id: 'ch3', label: 'Coolant level', required: true },
  { id: 'ch4', label: 'Tracks / Undercarriage condition', required: true },
  { id: 'ch5', label: 'Bucket and teeth condition', required: true },
  { id: 'ch6', label: 'Safety devices (backup alarm, lights)', required: true },
  { id: 'ch7', label: 'Fire extinguisher present', required: true },
  { id: 'ch8', label: 'Mirrors and windows clean', required: false },
  { id: 'ch9', label: 'Seat belt functional', required: true },
  { id: 'ch10', label: 'No visible leaks', required: true },
];

// Mock JHA Form
export const jhaForms: JHAForm[] = [
  {
    id: 'jha-001',
    siteName: 'Downtown Tower Project',
    date: new Date().toISOString().split('T')[0],
    foremanName: 'Maria Garcia',
    hazards: [
      {
        id: 'h1',
        hazard: 'Fall hazard - working at height',
        mitigation: 'Use fall protection harness, secure anchor points',
      },
      {
        id: 'h2',
        hazard: 'Struck by - crane operations',
        mitigation: 'Establish exclusion zones, use spotters, radio communication',
      },
      {
        id: 'h3',
        hazard: 'Excavation cave-in',
        mitigation: 'Shore trench walls, keep materials 2ft from edge',
      },
      {
        id: 'h4',
        hazard: 'Electrical hazard - overhead lines',
        mitigation: 'Maintain 10ft clearance, use spotter for equipment',
      },
    ],
    crewMembers: [
      { id: 'cm1', name: 'John Smith', signed: true, signedAt: '6:30 AM' },
      { id: 'cm2', name: 'Mike Wilson', signed: true, signedAt: '6:32 AM' },
      { id: 'cm3', name: 'Sarah Chen', signed: false },
      { id: 'cm4', name: 'Tom Brown', signed: false },
      { id: 'cm5', name: 'James Lee', signed: false },
    ],
  },
];

// Dashboard stats
export const dashboardStats = {
  totalEmployees: 127,
  totalEquipment: 23,
  expiringItems: 8,
  expiredItems: 3,
  todayInspections: {
    completed: 18,
    pending: 5,
    failed: 1,
  },
};

// Helper functions
export function getEmployeeByQrCode(qrCode: string): Employee | undefined {
  return employees.find((e) => e.qrCode === qrCode);
}

export function getEquipmentByQrCode(qrCode: string): Equipment | undefined {
  return equipment.find((e) => e.qrCode === qrCode);
}

export function getJHAFormById(id: string): JHAForm | undefined {
  return jhaForms.find((j) => j.id === id);
}
