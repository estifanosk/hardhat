# Product Spec (Draft v2): Construction Compliance & Safety SaaS

## 1. Product Summary
A web + mobile platform for construction companies to manage workforce certifications, equipment compliance, field safety workflows, and audit-ready records.

## 2. Goals
- Reduce compliance risk from expired certs/licenses and missed inspections.
- Make onsite verification instant via QR scan.
- Centralize employee, equipment, and safety records in one system.
- Improve field-to-office communication for maintenance and hazards.

## 3. Target Users
- Employee / Operator
- Foreman / Supervisor
- Safety Inspector / Safety Manager
- Mechanic / Maintenance Tech
- Office Admin / Super Admin
- External Auditor (read-only)

## 4. Core Features

### A. Employee Compliance Profiles
- Employee profile: name, company, role, photo, crew/site assignment.
- Certifications/licenses/task training records.
- Document uploads (PDF/image), issue/expiry dates, issuing body.
- Status tags: Active, Expiring Soon, Expired.
- QR code generated per employee for hard-hat sticker.
- QR scan view: certification summary + detailed drill-down.

### B. Expiration Alerts
- Configurable reminder windows (e.g., 30/14/7 days).
- Notifications to employee + safety/admin roles.
- Channels: in-app, email, optional SMS (phase 2).
- Escalation if not renewed by expiry date.

### C. Equipment / Vehicle Records
- Asset profile: ID, type, photo, site, assigned operator(s).
- Registration, insurance, inspection docs with expiry dates.
- Maintenance history, repair logs, service intervals.
- Asset QR code for quick lookup in the field.

### D. Daily Field Operations
- Pre-use checklist templates by equipment type.
- Daily inspection logs with pass/fail + required comments.
- Damage/fault reporting with photo/video upload.
- Maintenance ticket created from failed checklist item.
- Real-time visibility for mechanics and supervisors.

### E. Safety Operations (JHA)
- Daily Job Hazard Analysis forms by site/crew.
- Task-specific hazard entries + mitigation controls.
- Crew attendance/sign-off (digital signature/acknowledgment).
- Archive and search by date/site/crew for audits.

### F. Role-Based Access Control (RBAC)

#### Background
Construction companies require workers to carry multiple certifications, licenses, and task training records at all times. Foremen and safety inspectors need to verify compliance instantly in the field. Admins in the office must organize, track, and renew records across entire crews and equipment fleets. Different people in the organization need different levels of access to do their jobs without exposing data they shouldn't see.

#### Roles

| Role | Who They Are |
|------|-------------|
| `super_admin` | Office staff — full control over all employees, equipment, users, and settings |
| `safety_admin` | Safety department — manages certifications and compliance, receives all alerts |
| `foreman` | Job site lead — verifies crew compliance, runs inspections, submits JHAs |
| `employee` | Worker — manages their own profile and certifications, submits inspections, signs JHAs |
| `mechanic` | Maintenance tech — manages equipment logs and maintenance records only |
| `inspector` | External auditor — read-only via QR scan, no login required |

#### Permissions Matrix

| Action | super_admin | safety_admin | foreman | employee | mechanic |
|--------|-------------|--------------|---------|----------|----------|
| Manage all users & roles | ✅ | ❌ | ❌ | ❌ | ❌ |
| View all employees | ✅ | ✅ | ✅ (own site) | ❌ | ❌ |
| Create / edit / delete employees | ✅ | ✅ | ❌ | ❌ | ❌ |
| View own profile | ✅ | ✅ | ✅ | ✅ | ✅ |
| Edit own profile & certs | ✅ | ✅ | ✅ | ✅ | ✅ |
| Add certs to other employees | ✅ | ✅ | ❌ | ❌ | ❌ |
| View all equipment | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create / edit / delete equipment | ✅ | ✅ | ❌ | ❌ | ✅ |
| Run daily inspections | ✅ | ✅ | ✅ | ✅ | ✅ |
| Add maintenance logs | ✅ | ❌ | ❌ | ❌ | ✅ |
| Submit / view JHAs | ✅ | ✅ | ✅ | ✅ | ❌ |
| Receive expiry alerts | ✅ | ✅ | ❌ | ✅ (own) | ❌ |
| Export / download data | ✅ | ✅ | ❌ | ❌ | ❌ |
| Manage company settings | ✅ | ❌ | ❌ | ❌ | ❌ |

#### Key Design Decisions

- **Employees get logins** so they can upload their own cert documents from their phone and keep their profile up to date — but they only see themselves, not other workers.
- **Foremen are scoped to their job site** — they see the crew at their site, not the entire company roster.
- **Mechanics are separate from employees** — they have write access to equipment records but cannot view or touch employee data.
- **External inspectors never log in** — the QR scan page is fully public. No friction, no account required. Anyone with the URL (e.g., OSHA inspector, insurance auditor) can view compliance status.
- **Expiry alerts go to**: the employee themselves + safety_admin + super_admin.
- **Employee-uploaded certs** require safety_admin or super_admin approval before becoming active (approval workflow).

#### Notification Targets by Event

| Event | Notified |
|-------|----------|
| Cert expiring in 30 days | employee + safety_admin + super_admin |
| Cert expiring in 7 days | employee + safety_admin + super_admin |
| Cert expired | employee + safety_admin + super_admin |
| Equipment doc expiring | safety_admin + super_admin |
| Inspection failed | foreman (site) + safety_admin |
| Maintenance ticket created | mechanic + safety_admin |

### G. Authentication (Passwordless)

No user in HardHat should ever need a password. Field workers are outdoors, wearing gloves, and working under pressure — typing passwords on a phone is unacceptable UX. Office admins already have company Google or Microsoft accounts.

#### Auth method by role

| Role | Method | Rationale |
|------|--------|-----------|
| `super_admin` | Google / Microsoft OAuth | Company account, seamless SSO |
| `safety_admin` | Google / Microsoft OAuth | Company account, seamless SSO |
| `foreman` | Magic link (email) or Phone OTP | Field worker, picks preferred method |
| `employee` | Magic link (email) or Phone OTP | Field worker, picks preferred method |
| `mechanic` | Magic link (email) or Phone OTP | Field worker, picks preferred method |
| `inspector` | No login — public QR scan page | No friction for external auditors |

#### Magic link (email)
User enters their email (personal or work) → receives a one-click sign-in link → taps it → logged in. No password ever set or required. Powered by Supabase Auth, free tier covers all usage.

#### Phone OTP (SMS)
User enters their phone number → receives a 6-digit SMS code → enters it → logged in. Best for workers without consistent email access. Requires Twilio integration via Supabase. **Planned for Phase 2** once SMS costs are covered by subscription revenue.

#### Login page UX (field workers)
```
┌─────────────────────────────┐
│  Sign in to HardHat         │
│                             │
│  Email                      │
│  [you@example.com        ]  │
│  [Send magic link        ]  │
│                             │
│  ──────── or ────────       │
│                             │
│  Phone                      │
│  [+1 (555) 000-0000      ]  │
│  [Send code              ]  │
└─────────────────────────────┘
```

#### Invite flow
Admins invite users from the User Management page by entering their email or phone. Supabase sends the invite — the user clicks the link and their account is activated with the role the admin assigned. No password setup step.

#### Implementation phases
- **Phase 1 (now)**: Magic link via email for all roles
- **Phase 2**: Add phone OTP option for foreman / employee / mechanic
- **Future**: Google/Microsoft OAuth for admin roles

### I. SaaS Billing
- Subscription pricing by active employee and/or asset count.
- Monthly billing cycles, plan tiers, usage dashboard.
- Admin billing portal and invoicing.

### J. Admin Configuration (NEW)
- **Checklist Template Builder**: Admins can create, edit, and assign pre-use inspection checklists per equipment type or job site.
- **JHA Form Customization**: Configurable hazard categories and task fields per company/site requirements.
- **Approval Workflow Settings**: Define whether employee-uploaded certs require manager approval before activation.
- **Notification Preferences**: Company-level defaults for alert timing and escalation rules.

### K. External Auditor Access (NEW)
- **Guest Access Links**: Generate time-limited, read-only links for external inspectors (e.g., OSHA, insurance auditors).
- **Scope Control**: Limit guest access to specific employees, crews, sites, or date ranges.
- **Access Logging**: Track all external access for compliance audit trail.
- **No Account Required**: External parties view via secure link without creating login.

### L. Data Import & Onboarding (NEW)
- **Bulk CSV Import**: Upload employee rosters, certifications, and equipment inventories during initial setup.
- **Template Downloads**: Provide standardized CSV templates for each data type.
- **Validation & Error Reporting**: Preview imports, flag errors (missing fields, invalid dates), allow corrections before commit.
- **Photo Batch Upload**: Match uploaded cert/license images to records via filename or ID.

## 5. Mobile Application

### A. Platform Strategy
| Option | Pros | Cons |
|--------|------|------|
| **React Native / Flutter (Recommended)** | Single codebase, faster development, cost-effective | Slight performance trade-off |
| Native (iOS + Android) | Best performance, full device access | 2x development effort, higher cost |
| Progressive Web App (PWA) | No app store, instant updates | Limited offline, no push on iOS |

**Recommendation**: Cross-platform (React Native or Flutter) for MVP to reduce cost and time-to-market.

### B. Core Mobile Features

**QR Scanner Module**
- Native camera integration for fast QR scanning.
- Scan employee hard hat codes → instant compliance summary.
- Scan equipment codes → asset details, last inspection, status.
- Works in low-light conditions (flash toggle).

**Employee Self-Service**
- View own certifications, licenses, training records.
- Upload new cert documents (camera capture or file picker).
- Receive expiration alerts via push notification.
- Update profile photo.

**Field Inspections**
- Daily pre-use checklists with offline support.
- Pass/fail toggles, required comment fields.
- Photo/video capture for damage reporting.
- GPS tagging for inspection location.
- Submit when back online (queued sync).

**JHA / Safety Meetings**
- Digital sign-in for crew safety meetings.
- View daily hazards assigned to tasks.
- Acknowledge/sign-off with finger signature or tap.

**Notifications**
- Push notifications for expiring certs (configurable timing).
- Alerts when assigned equipment fails inspection.
- Maintenance ticket updates for mechanics.

### C. Offline Mode (Phase 2+)
- Cache employee/equipment data for assigned crew/site.
- Complete inspections and checklists offline.
- Queue photo uploads and form submissions.
- Auto-sync when connectivity restored.
- Conflict resolution for concurrent edits.

**Open Question**: Is offline mode required for Phase 1? (Some job sites have limited connectivity)

### D. Mobile UX Considerations
- **Large touch targets**: Gloved hands, outdoor use.
- **High contrast UI**: Readable in direct sunlight.
- **Minimal typing**: Dropdowns, toggles, voice-to-text option.
- **Fast load times**: Workers won't wait; target <2s for any screen.
- **Simple navigation**: Max 2-3 taps to any feature.
- **Battery efficient**: Limit background processes.

### E. Device Requirements
- iOS 14+ / Android 10+
- Camera with autofocus (for QR and photo capture).
- GPS (for inspection location tagging).
- Minimum 2GB RAM recommended.

### F. Mobile vs Web Feature Matrix

| Feature | Mobile | Web |
|---------|--------|-----|
| QR scanning | Primary | Secondary (webcam) |
| Photo/video capture | Primary | Upload only |
| Pre-use checklists | Primary | View/edit |
| JHA sign-off | Primary | View/manage |
| Push notifications | Yes | Email fallback |
| Admin configuration | Limited | Full |
| Bulk import | No | Yes |
| Reports & exports | View only | Full |
| Billing management | No | Yes |

---

## 6. Functional Requirements (MVP)
- Multi-tenant company accounts.
- Employee and asset CRUD.
- Certification/license/task training tracking with expirations.
- QR code generation and scan-based lookup.
- Alert engine for expiring records.
- Checklist + defect report + media upload.
- JHA form workflow with sign-off.
- RBAC with audit trail of changes.
- CSV export + PDF report downloads.
- **CSV bulk import for employees, assets, and certifications.** (NEW)
- **Guest access links for external auditors.** (NEW)
- **Admin-configurable checklist templates.** (NEW)

## 7. Non-Functional Requirements
- Security: encrypted data at rest/in transit, SSO optional, MFA for admins.
- Compliance: immutable audit logs for critical actions.
- Availability: 99.9% uptime target.
- Performance: scan result loads in <2 seconds on normal mobile network.
- Mobile-first UX for field users.
- Data retention and backup policy configurable per tenant.
- **Localization-ready architecture** (if multilingual support confirmed). (NEW)

## 8. Key Data Entities
- Company, User, Role
- Employee, Certification, License, TrainingRecord
- Asset, Inspection, MaintenanceLog, DefectTicket
- JHAForm, HazardItem, Signoff
- Notification, Document, AuditLog
- Subscription, Invoice, UsageMetric
- **ChecklistTemplate, FormField** (NEW)
- **GuestAccessToken** (NEW)
- **ImportJob, ImportError** (NEW)

## 9. MVP Delivery Plan

### Phase 1 (Core MVP)
- Employee profiles, cert tracking, QR scan, alerts, basic RBAC.
- **Bulk CSV import for employees and certifications.**
- **Admin checklist template configuration (basic).**

### Phase 2 (Equipment & Field Ops)
- Asset module, checklists, defect tickets, media upload.
- **Guest access links for external auditors.**
- **Multilingual support (if confirmed).**

### Phase 3 (Safety & Scale)
- JHA workflows, reporting, billing automation, pilot hardening.
- **Advanced form customization.**
- **Integration APIs (HR/payroll systems).**

## 10. Success Metrics
- % reduction in expired certs/licenses.
- Time to verify worker compliance onsite.
- % daily checklist completion.
- Mean time from defect report to mechanic acknowledgment.
- Pilot retention and paid conversion rate.
- **Time to onboard new company (target: <1 day with bulk import).** (NEW)
- **External audit preparation time reduction.** (NEW)

## 11. Open Questions
- Is offline mode required for low/no-signal job sites at MVP?
- Any compliance frameworks required (OSHA-specific reporting, union requirements)?
- Preferred reminder channels (email/SMS/push) and escalation chain?
- Should employee-uploaded certs require manager approval before becoming active?
- **What existing systems (HR, payroll, fleet) need integration priority?** (NEW)
- **Primary languages needed beyond English for field workers? (e.g., Spanish)** (NEW)
- **Are there specific OSHA report formats required for export?** (NEW)

---

## Appendix A: Simplified MVP ("One QR, One View")

### Core Value Proposition
**Scan a QR code → instantly see if this person/equipment is compliant and ready to work.**

No app install required. Works on any smartphone camera.

### MVP Feature Set (4 Screens + Admin)

**Screen 1: Employee QR Scan Result**
```
┌─────────────────────────────┐
│  [PHOTO]   JOHN SMITH       │
│            Operator         │
│  ✅ COMPLIANT               │
│                             │
│  Certifications:            │
│  ✅ OSHA 30 (exp: 2026-08)  │
│  ✅ Forklift (exp: 2025-12) │
│  ⚠️ Rigging (exp: 30 days)  │
│                             │
│  Task Training:             │
│  ✅ Excavator               │
│  ✅ Crane Signal            │
└─────────────────────────────┘
```

**Screen 2: Equipment QR Scan Result**
```
┌─────────────────────────────┐
│  [PHOTO]   CAT 320 #EQ-042  │
│            Excavator        │
│  ✅ READY                   │
│                             │
│  ✅ Registration (2026-03)  │
│  ✅ Insurance (2026-01)     │
│  ✅ Last inspection: Today  │
│                             │
│  [START DAILY CHECKLIST]    │
└─────────────────────────────┘
```

**Screen 3: Daily Checklist (Mobile Form)**
- 5-10 pass/fail items (engine, hydraulics, safety devices, etc.)
- Photo upload for any defects
- Submit → timestamps + GPS location
- Fail item → creates maintenance alert

**Screen 4: Simple JHA Sign-off**
- Foreman selects site + crew
- Pre-loaded hazards for job type
- Crew members tap to acknowledge
- Stored for compliance records

**Admin Portal (Web)**
- Add/edit employees + certs + expiry dates
- Add/edit equipment + docs
- Generate & print QR code stickers
- View compliance dashboard (who's expiring, what needs inspection)
- Email alerts for expirations (7/14/30 day)
- CSV import for bulk onboarding

### What's NOT in MVP
| Deferred | Why |
|----------|-----|
| Native mobile app | PWA works, no app store friction |
| Offline mode | Most sites have cell signal; add later |
| Role-based permissions | Start with admin + viewer only |
| Custom form builder | Use fixed templates initially |
| Billing/subscriptions | Manual invoicing for pilots |
| SMS notifications | Email is sufficient |
| Integrations | No external systems yet |

### Recommended Tech Stack

| Component | Choice | Rationale |
|-----------|--------|-----------|
| **Database + Auth + Storage** | Supabase | Free tier, PostgreSQL, built-in auth, file storage, real-time |
| **Admin Portal** | Next.js | Fast dev, deploy to Vercel free tier |
| **Mobile Experience** | PWA | No app install, any phone camera opens link |
| **QR Generation** | `qrcode` npm package | Free, simple URL encoding |
| **Email Alerts** | Resend or SendGrid | Free tier covers MVP |
| **Hosting** | Vercel | Free tier, auto-deploy from Git |

**Total MVP infrastructure cost: $0-50/month**

### QR Code Strategy

URLs are simple and scannable by any phone:
```
Employee: https://app.example.com/e/abc123
Equipment: https://app.example.com/eq/xyz789
```

- Print QR stickers (Avery labels or industrial stickers for hard hats)
- Scanning = opening the URL = instant status page
- No app needed to VIEW (just a browser)
- Login only required to EDIT or submit checklists

### MVP Data Model (Simplified)

```
Company
  └── Employee
        ├── name, photo, role
        ├── qr_code_id
        └── Certification[] (name, expiry, doc_url, status)

  └── Equipment
        ├── name, type, photo
        ├── qr_code_id
        ├── Document[] (registration, insurance, etc.)
        └── Inspection[] (date, checklist_results, photos, inspector)

  └── JHAForm
        ├── site, date, crew
        ├── hazards[]
        └── signoffs[] (employee, timestamp)
```

### MVP Build Estimate

| Task | Scope |
|------|-------|
| Database schema + Supabase setup | Small |
| Admin portal (CRUD + QR generation) | Medium |
| Employee scan page | Small |
| Equipment scan page + checklist form | Medium |
| JHA form + sign-off | Medium |
| Email alerts (cron job) | Small |
| CSV import | Small |
| Testing + polish | Medium |

### Success = Pilot Validation

MVP is successful when:
- [ ] 1 company onboarded (50+ employees, 20+ equipment)
- [ ] Foremen scanning QR codes daily in field
- [ ] Daily checklists being submitted
- [ ] Expiration alerts preventing compliance lapses
- [ ] Client willing to pay for continued use

---

## Appendix B: Future Phases (Post-MVP)

| Phase | Features |
|-------|----------|
| **Phase 2** | Native mobile app, offline mode, photo OCR for cert upload, guest auditor links |
| **Phase 3** | Custom form builder, advanced RBAC, maintenance ticket workflow |
| **Phase 4** | Billing automation, integrations (HR/payroll), analytics dashboard |

---

*Document Version: 2.1*
*Last Updated: 2026-05-12*
*Changes: Simplified MVP to core QR scan loop; added tech stack recommendation*
