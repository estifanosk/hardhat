# Design Document: HardHat

**Codename**: HardHat
**Tagline**: Scan. Verify. Work Safe.

## Overview

**Product**: QR-based construction workforce and equipment compliance system
**Goal**: Scan a QR code → instantly verify if employee/equipment is compliant
**Stack**: Next.js + Supabase + Vercel

---

## 1. Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                           VERCEL                                │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Next.js App                            │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐   │  │
│  │  │ Admin Portal│  │ Public Scan │  │   API Routes     │   │  │
│  │  │ /admin/*    │  │ /e/[id]     │  │   /api/*         │   │  │
│  │  │ /dashboard  │  │ /eq/[id]    │  │                  │   │  │
│  │  └─────────────┘  └─────────────┘  └──────────────────┘   │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         SUPABASE                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  PostgreSQL  │  │   Auth       │  │   Storage (S3)       │   │
│  │  - companies │  │   - email    │  │   - cert docs        │   │
│  │  - employees │  │   - magic    │  │   - photos           │   │
│  │  - equipment │  │     link     │  │   - inspection imgs  │   │
│  │  - certs     │  │              │  │                      │   │
│  │  - inspect.  │  │              │  │                      │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                          │
│  ┌──────────────┐  ┌──────────────┐                             │
│  │   Resend     │  │  Vercel Cron │                             │
│  │   (emails)   │  │  (alerts)    │                             │
│  └──────────────┘  └──────────────┘                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | Next.js 14 (App Router) | Full-stack React framework |
| Database | Supabase PostgreSQL | Relational data, RLS policies |
| Auth | Supabase Auth | Email/password, magic links |
| Storage | Supabase Storage | PDFs, photos |
| Hosting | Vercel | Serverless, edge functions |
| Styling | Tailwind CSS | Rapid UI development |
| UI Components | shadcn/ui | Pre-built accessible components |
| QR Generation | `qrcode` package | Generate QR code images |
| Email | Resend | Transactional emails |
| Cron Jobs | Vercel Cron | Daily expiration checks |

---

## 3. Database Schema

```sql
-- Companies (multi-tenant)
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Users (admins who manage data)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  company_id UUID REFERENCES companies(id),
  email TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'admin', -- 'admin' | 'viewer'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Employees (workers with certs)
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) NOT NULL,
  qr_code TEXT UNIQUE NOT NULL, -- short ID for QR URL
  name TEXT NOT NULL,
  role TEXT, -- 'operator', 'foreman', etc.
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Certifications (linked to employees)
CREATE TABLE certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- 'OSHA 30', 'Forklift', etc.
  type TEXT, -- 'certification' | 'license' | 'task_training'
  issuing_body TEXT,
  issue_date DATE,
  expiry_date DATE,
  document_url TEXT, -- stored in Supabase Storage
  status TEXT GENERATED ALWAYS AS (
    CASE
      WHEN expiry_date IS NULL THEN 'active'
      WHEN expiry_date < CURRENT_DATE THEN 'expired'
      WHEN expiry_date < CURRENT_DATE + INTERVAL '30 days' THEN 'expiring_soon'
      ELSE 'active'
    END
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Equipment / Vehicles
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) NOT NULL,
  qr_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL, -- 'CAT 320 Excavator'
  type TEXT, -- 'excavator', 'forklift', 'crane', etc.
  identifier TEXT, -- internal ID like 'EQ-042'
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Equipment Documents (registration, insurance, etc.)
CREATE TABLE equipment_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- 'Registration', 'Insurance', 'Inspection Cert'
  expiry_date DATE,
  document_url TEXT,
  status TEXT GENERATED ALWAYS AS (
    CASE
      WHEN expiry_date IS NULL THEN 'active'
      WHEN expiry_date < CURRENT_DATE THEN 'expired'
      WHEN expiry_date < CURRENT_DATE + INTERVAL '30 days' THEN 'expiring_soon'
      ELSE 'active'
    END
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Daily Inspections (checklists)
CREATE TABLE inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
  inspector_name TEXT NOT NULL,
  inspection_date DATE DEFAULT CURRENT_DATE,
  checklist JSONB NOT NULL, -- [{item: "Engine", passed: true}, ...]
  notes TEXT,
  photos TEXT[], -- array of storage URLs
  latitude DECIMAL,
  longitude DECIMAL,
  status TEXT, -- 'passed' | 'failed' | 'needs_attention'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- JHA Forms
CREATE TABLE jha_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) NOT NULL,
  site_name TEXT NOT NULL,
  form_date DATE DEFAULT CURRENT_DATE,
  foreman_name TEXT,
  hazards JSONB, -- [{hazard: "Fall risk", mitigation: "Harness required"}, ...]
  created_at TIMESTAMPTZ DEFAULT now()
);

-- JHA Sign-offs
CREATE TABLE jha_signoffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jha_form_id UUID REFERENCES jha_forms(id) ON DELETE CASCADE,
  employee_name TEXT NOT NULL,
  signed_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_employees_company ON employees(company_id);
CREATE INDEX idx_employees_qr ON employees(qr_code);
CREATE INDEX idx_equipment_company ON equipment(company_id);
CREATE INDEX idx_equipment_qr ON equipment(qr_code);
CREATE INDEX idx_certifications_expiry ON certifications(expiry_date);
CREATE INDEX idx_equipment_documents_expiry ON equipment_documents(expiry_date);
```

---

## 4. API Routes

### Public (No Auth Required)
| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/scan/employee/[qr_code]` | Get employee compliance status |
| GET | `/api/scan/equipment/[qr_code]` | Get equipment status |

### Protected (Auth Required)
| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/employees` | List employees |
| POST | `/api/employees` | Create employee |
| PUT | `/api/employees/[id]` | Update employee |
| DELETE | `/api/employees/[id]` | Delete employee |
| POST | `/api/employees/[id]/certifications` | Add certification |
| GET | `/api/equipment` | List equipment |
| POST | `/api/equipment` | Create equipment |
| PUT | `/api/equipment/[id]` | Update equipment |
| DELETE | `/api/equipment/[id]` | Delete equipment |
| POST | `/api/inspections` | Submit daily inspection |
| GET | `/api/inspections/[equipment_id]` | Get inspection history |
| POST | `/api/jha` | Create JHA form |
| POST | `/api/jha/[id]/signoff` | Sign JHA form |
| GET | `/api/dashboard` | Compliance overview stats |
| POST | `/api/import/csv` | Bulk import employees |
| GET | `/api/qr/[type]/[id]` | Generate QR code image |

### Cron (Vercel Cron)
| Schedule | Route | Purpose |
|----------|-------|---------|
| Daily 8am | `/api/cron/expiration-alerts` | Send expiration warning emails |

---

## 5. Page Structure

```
app/
├── (public)/
│   ├── e/[qr_code]/page.tsx        # Employee scan result
│   ├── eq/[qr_code]/page.tsx       # Equipment scan result
│   ├── eq/[qr_code]/inspect/page.tsx  # Daily checklist form
│   └── jha/[id]/sign/page.tsx      # JHA sign-off page
│
├── (auth)/
│   ├── login/page.tsx              # Login page
│   └── signup/page.tsx             # Signup (create company)
│
├── (dashboard)/
│   ├── layout.tsx                  # Dashboard layout with sidebar
│   ├── page.tsx                    # Dashboard home (stats)
│   ├── employees/
│   │   ├── page.tsx                # Employee list
│   │   ├── new/page.tsx            # Add employee
│   │   └── [id]/page.tsx           # Edit employee + certs
│   ├── equipment/
│   │   ├── page.tsx                # Equipment list
│   │   ├── new/page.tsx            # Add equipment
│   │   └── [id]/page.tsx           # Edit equipment + docs
│   ├── inspections/page.tsx        # Inspection history
│   ├── jha/
│   │   ├── page.tsx                # JHA list
│   │   └── new/page.tsx            # Create JHA
│   ├── qr-codes/page.tsx           # Generate & print QR codes
│   ├── import/page.tsx             # CSV import
│   └── settings/page.tsx           # Company settings
│
├── api/
│   ├── scan/
│   │   ├── employee/[qr_code]/route.ts
│   │   └── equipment/[qr_code]/route.ts
│   ├── employees/route.ts
│   ├── equipment/route.ts
│   ├── inspections/route.ts
│   ├── jha/route.ts
│   ├── qr/[type]/[id]/route.ts
│   ├── import/csv/route.ts
│   └── cron/expiration-alerts/route.ts
│
└── layout.tsx                      # Root layout
```

---

## 6. UI Wireframes

### Employee Scan Result (`/e/[qr_code]`)

```
┌─────────────────────────────────┐
│  ┌─────┐                        │
│  │PHOTO│   JOHN SMITH           │
│  └─────┘   Crane Operator       │
│            ABC Construction     │
│                                 │
│  ┌─────────────────────────────┐│
│  │      ✅ COMPLIANT           ││
│  └─────────────────────────────┘│
│                                 │
│  CERTIFICATIONS                 │
│  ├─ ✅ OSHA 30-Hour             │
│  │     Expires: Aug 15, 2026    │
│  ├─ ✅ Forklift Operator        │
│  │     Expires: Dec 01, 2025    │
│  └─ ⚠️  Rigging Certification   │
│        Expires: Jun 10, 2025    │
│        (30 days remaining)      │
│                                 │
│  TASK TRAINING                  │
│  ├─ ✅ Excavator                │
│  ├─ ✅ Crane Signals            │
│  └─ ✅ Confined Space           │
│                                 │
│  ─────────────────────────────  │
│  Last updated: May 12, 2025     │
└─────────────────────────────────┘
```

### Equipment Scan Result (`/eq/[qr_code]`)

```
┌─────────────────────────────────┐
│  ┌─────┐                        │
│  │PHOTO│   CAT 320 EXCAVATOR    │
│  └─────┘   ID: EQ-042           │
│            Site: Downtown Tower │
│                                 │
│  ┌─────────────────────────────┐│
│  │       ✅ READY              ││
│  └─────────────────────────────┘│
│                                 │
│  DOCUMENTS                      │
│  ├─ ✅ Registration             │
│  │     Expires: Mar 20, 2026    │
│  ├─ ✅ Insurance                │
│  │     Expires: Jan 15, 2026    │
│  └─ ✅ Annual Inspection        │
│        Expires: Nov 30, 2025    │
│                                 │
│  LAST INSPECTION                │
│  ✅ Passed - Today 6:45 AM      │
│     By: Mike Johnson            │
│                                 │
│  ┌─────────────────────────────┐│
│  │   🔍 START DAILY CHECKLIST  ││
│  └─────────────────────────────┘│
│                                 │
│  📋 View Inspection History     │
└─────────────────────────────────┘
```

### Daily Inspection Checklist (`/eq/[qr_code]/inspect`)

```
┌─────────────────────────────────┐
│  DAILY INSPECTION               │
│  CAT 320 EXCAVATOR (EQ-042)     │
│  ─────────────────────────────  │
│                                 │
│  Inspector Name                 │
│  ┌─────────────────────────────┐│
│  │ Mike Johnson                ││
│  └─────────────────────────────┘│
│                                 │
│  PRE-USE CHECKLIST              │
│                                 │
│  Engine & Fluids         ✅ ❌  │
│  ──────────────────────  [●][ ] │
│                                 │
│  Hydraulic System        ✅ ❌  │
│  ──────────────────────  [●][ ] │
│                                 │
│  Tracks / Undercarriage  ✅ ❌  │
│  ──────────────────────  [●][ ] │
│                                 │
│  Safety Devices          ✅ ❌  │
│  ──────────────────────  [ ][●] │
│                                 │
│  Lights & Signals        ✅ ❌  │
│  ──────────────────────  [●][ ] │
│                                 │
│  Notes (required if any ❌)     │
│  ┌─────────────────────────────┐│
│  │ Backup alarm not working    ││
│  └─────────────────────────────┘│
│                                 │
│  📷 Add Photos                  │
│  [photo1.jpg] [+ Add More]      │
│                                 │
│  ┌─────────────────────────────┐│
│  │      SUBMIT INSPECTION      ││
│  └─────────────────────────────┘│
└─────────────────────────────────┘
```

### Dashboard Home (`/dashboard`)

```
┌─────────────────────────────────────────────────────────────┐
│  COMPLIANCE DASHBOARD                      [ABC Construction]│
│  ───────────────────────────────────────────────────────────│
│                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐│
│  │     127     │ │      23     │ │      8      │ │    3    ││
│  │  Employees  │ │  Equipment  │ │  Expiring   │ │ Expired ││
│  │             │ │             │ │  (30 days)  │ │         ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────┘│
│                                                             │
│  ⚠️  NEEDS ATTENTION                                        │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ John Smith    │ Rigging Cert      │ Expires in 12 days  ││
│  │ Jane Doe      │ OSHA 30           │ Expires in 18 days  ││
│  │ EQ-042        │ Insurance         │ Expires in 25 days  ││
│  │ Mike Wilson   │ Forklift License  │ EXPIRED 3 days ago  ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  TODAY'S INSPECTIONS                                        │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ ✅ EQ-042 Excavator    │ 6:45 AM  │ Mike Johnson       ││
│  │ ✅ EQ-018 Forklift     │ 7:02 AM  │ Sarah Chen         ││
│  │ ❌ EQ-033 Crane        │ 7:15 AM  │ Tom Brown (failed) ││
│  │ ⏳ EQ-007 Loader       │ Not yet inspected today       ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  QUICK ACTIONS                                              │
│  [+ Add Employee]  [+ Add Equipment]  [📥 Import CSV]       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Authentication Flow

```
1. SIGNUP (New Company)
   └─> Create auth user (Supabase Auth)
   └─> Create company record
   └─> Create user record (linked to company)
   └─> Redirect to /dashboard

2. LOGIN
   └─> Email + password OR magic link
   └─> Supabase session created
   └─> Redirect to /dashboard

3. PROTECTED ROUTES
   └─> Middleware checks Supabase session
   └─> No session? Redirect to /login
   └─> Valid session? Allow access

4. PUBLIC SCAN ROUTES (/e/*, /eq/*)
   └─> No auth required to VIEW
   └─> Auth required to SUBMIT inspection
```

---

## 8. QR Code Strategy

### URL Format
```
Employee: https://hardhat.vercel.app/e/{qr_code}
Equipment: https://hardhat.vercel.app/eq/{qr_code}
```

### QR Code ID Generation
- Use `nanoid` package for short, unique IDs
- 8 characters: `a1b2c3d4`
- URL-safe characters only

### QR Code Generation
```typescript
import QRCode from 'qrcode';

async function generateQRCode(type: 'e' | 'eq', id: string): Promise<string> {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/${type}/${id}`;
  return await QRCode.toDataURL(url, {
    width: 300,
    margin: 2,
    color: { dark: '#000000', light: '#ffffff' }
  });
}
```

### Printing
- Admin portal has "Print QR Codes" page
- Select employees/equipment
- Generate printable PDF with QR codes + names
- Compatible with Avery labels or industrial stickers

---

## 9. File Storage Structure

```
Supabase Storage Buckets:

certificates/
  └── {company_id}/
      └── {employee_id}/
          └── {cert_id}.pdf

equipment-docs/
  └── {company_id}/
      └── {equipment_id}/
          └── {doc_id}.pdf

photos/
  └── employees/
      └── {employee_id}.jpg
  └── equipment/
      └── {equipment_id}.jpg
  └── inspections/
      └── {inspection_id}/
          └── 1.jpg, 2.jpg, ...
```

---

## 10. Email Templates

### Expiration Warning (7 days)
```
Subject: ⚠️ Certification Expiring Soon: {cert_name}

Hi {admin_name},

The following certification will expire in 7 days:

Employee: {employee_name}
Certification: {cert_name}
Expiry Date: {expiry_date}

Please ensure renewal is scheduled.

View in HardHat: {dashboard_link}
```

### Expiration Warning (1 day)
```
Subject: 🚨 URGENT: Certification Expires Tomorrow

...
```

---

## 11. Environment Variables

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# App
NEXT_PUBLIC_APP_URL=https://hardhat.vercel.app

# Email (Resend)
RESEND_API_KEY=xxx
EMAIL_FROM=noreply@hardhat.app

# Cron secret (verify cron requests)
CRON_SECRET=xxx
```

---

## 12. Implementation Plan

### Phase 1: Foundation (Core Setup)
- [ ] Initialize Next.js project with TypeScript
- [ ] Set up Tailwind CSS + shadcn/ui
- [ ] Configure Supabase project
- [ ] Create database schema
- [ ] Set up Supabase Auth
- [ ] Create basic layout and navigation
- [ ] Deploy to Vercel

### Phase 2: Employee Module
- [ ] Employee CRUD (list, create, edit, delete)
- [ ] Certification management (add, edit, delete)
- [ ] Photo upload for employees
- [ ] Document upload for certifications
- [ ] QR code generation for employees
- [ ] Public employee scan page (/e/[qr_code])

### Phase 3: Equipment Module
- [ ] Equipment CRUD
- [ ] Equipment document management
- [ ] QR code generation for equipment
- [ ] Public equipment scan page (/eq/[qr_code])
- [ ] Daily inspection checklist form
- [ ] Photo upload for inspections
- [ ] Inspection history view

### Phase 4: JHA Module
- [ ] JHA form creation
- [ ] Hazard list management
- [ ] Crew sign-off page
- [ ] JHA history/archive

### Phase 5: Dashboard & Alerts
- [ ] Compliance dashboard with stats
- [ ] Expiring items list
- [ ] Today's inspections view
- [ ] Email alerts (Resend integration)
- [ ] Vercel cron job for daily alerts

### Phase 6: Import & Polish
- [ ] CSV import for employees
- [ ] CSV import for equipment
- [ ] QR code print page
- [ ] Mobile responsive polish
- [ ] Error handling & loading states
- [ ] Testing

---

## 13. Security Considerations

### Row Level Security (RLS)
```sql
-- Users can only see their company's data
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own company employees" ON employees
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

-- Repeat for equipment, certifications, etc.
```

### Public Scan Pages
- Read-only access
- No sensitive data exposed (no SSN, no salary, etc.)
- Rate limiting via Vercel

### File Uploads
- Validate file types (PDF, JPG, PNG only)
- Max file size: 10MB
- Virus scanning (optional, via external service)

---

## 14. Open Decisions

| Question | Options | Recommendation |
|----------|---------|----------------|
| QR code on hard hat material? | Paper sticker vs industrial vinyl | Industrial vinyl (weather resistant) |
| Inspection checklist items | Fixed per equipment type vs custom | Fixed templates for MVP, custom later |
| JHA hazard list | Pre-defined vs free text | Pre-defined categories + free text option |
| Offline support | PWA cache vs skip for MVP | Skip for MVP |
| Multi-language | English only vs i18n ready | English only, but use i18n structure |

---

## 15. Success Criteria (MVP)

- [ ] Admin can add employees with certifications
- [ ] Admin can add equipment with documents
- [ ] QR codes generated and printable
- [ ] Scanning QR shows compliance status (no login)
- [ ] Daily checklist can be submitted with photos
- [ ] JHA forms can be created and signed
- [ ] Dashboard shows expiring items
- [ ] Email alerts sent for expirations
- [ ] CSV import works for bulk onboarding
- [ ] Works on mobile browsers

---

*Document Version: 1.0*
*Created: 2025-05-12*
*Status: Ready for Review*
