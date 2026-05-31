# HardHat Video Guide Script

Target length: 4 to 5 minutes

Audience: super admins, safety admins, foremen, mechanics, and field supervisors.

---

## 1. Intro

HardHat helps construction teams verify worker compliance and equipment readiness directly from a QR code. Admins keep certification and document records up to date. Field teams scan QR codes on hard hats or equipment to instantly see a green, yellow, or red status before work begins.

---

## 2. Sign In

Go to the HardHat sign-in page and enter the email and password your super admin created for you. After signing in, HardHat sends you to the right workspace for your role automatically.

Super admins and safety admins land in the admin area. The navigation bar across the top gives access to Employees, Equipment, Users, and Help.

---

## 3. Dashboard

The dashboard gives you a real-time snapshot of your workforce and fleet.

Four summary cards at the top show total employees, total equipment, how many items are expiring soon, and how many have already expired. If your numbers look like 51 employees and 25 pieces of equipment, you know the full scope at a glance.

Below the summary, the **Needs Attention** panel lists individual expired certifications by name — for example, Amanda Evans has an expired Welding Certification, and Joshua Phillips has an expired OSHA 10-Hour. Each row links directly to that record so admins can act immediately.

The **Today's Inspections** panel on the right shows how many pre-use inspections have been completed today. If the site has not started yet, it shows "No inspections recorded today."

At the bottom, Quick Links let you jump straight to Manage Employees, Manage Equipment, Add Employee, or Add Equipment without navigating through the menu.

---

## 4. User Management

Open **Users** in the top navigation. Super admins can create team members directly from this page. Enter the user's full name, email, a temporary password, and their role.

Roles control what each person can see and do:

- **Super Admin** manages users and all compliance records.
- **Safety Admin** manages employee and equipment compliance.
- **Foreman** reviews crews and equipment in the field.
- **Mechanic** manages equipment readiness.
- **Employee** can view their own assigned profile.

If someone forgets their password, they can use the forgot-password link on the sign-in page.

---

## 5. Employee Compliance

Open **Employees**. Three summary cards at the top show how many workers are Compliant, Expiring Soon, and Non-Compliant. Each card is color-coded — green, orange, and red — so you can see the health of your workforce at a glance.

The list below shows every employee with their name, job title, company, certification count, and current status badge.

### Adding a new employee

Click **Add Employee**. Fill in:

- **Full name** — enter the name exactly as it appears on the worker's ID or certification documents.
- **Job title / role** — for example, Crane Operator, Electrician, or Site Supervisor.
- **Company** — the subcontractor or employer this worker belongs to.

Click **Create employee**. HardHat generates a unique QR code automatically. You can add certifications immediately after.

### Employee detail page

Open any employee to see their full record. The page is divided into sections:

**Employee details** — edit the name, job title, and company, then click Save changes.

**QR Code** — shows the unique QR code identifier for this worker. Use **Preview scan page** to see exactly what a field scan will look like. Use **Download QR image** to get a printable image for their hard hat or ID badge.

**Linked account** — connect this employee record to a HardHat login so the worker can view their own certifications and receive expiry alerts directly.

**Certifications & Licenses** — lists every credential on file. Each entry shows the certification name, type (Certification, License, or Task Training), issuing body, and expiry date. The status badge updates automatically: green for active, orange for expiring soon, and red for expired.

To add a new credential, use the **Add certification** form at the bottom of the section. Enter the name, select the type, add the issuing body, set the issue date, and enter an expiry date if the credential has one. Task training items often have no expiry — leave the expiry date blank and HardHat marks them as permanently active.

### Employee QR scan (field view)

When a field supervisor scans a worker's QR code with a phone camera, they see a clean mobile page showing the worker's name, job title, and company, followed by a large status banner.

- **Compliant** — green banner, all credentials are valid.
- **Expiring Soon** — yellow banner, at least one credential expires within 30 days.
- **Non-Compliant** — red banner, at least one credential has expired.

Below the banner, Certifications & Licenses lists each credential with its expiry date and how long ago it expired if relevant. Task training items appear in a separate **Task Training** section as compact chips.

A non-compliant worker means the admin needs to update or renew that credential before the worker is cleared for site.

---

## 6. Equipment Compliance

Open **Equipment**. The same three-state model applies here: **Ready**, **Needs Inspection**, and **Out of Service**. Summary cards at the top give you the count for each state across your entire fleet.

### Adding equipment

Click **Add Equipment** and fill in:

- **Name** — make and model, for example CAT 320 Excavator.
- **Type** — select from the dropdown (Excavator, Forklift, Crane, and so on).
- **Unit ID** — your internal unit number or serial number used to identify this piece of equipment.
- **Job site** — the current site where this equipment is deployed.

Click **Create equipment**. HardHat generates a QR code automatically. You can add documents and run inspections immediately after.

### Equipment detail page

Open any piece of equipment to see its full record. The page has several sections:

**Equipment details** — edit name, type, unit ID, and job site.

**Status override** — HardHat automatically computes the equipment status from its documents. If registration is expired, the equipment becomes Out of Service. If a document is expiring soon, it becomes Needs Inspection. You can override the status manually if needed — for example, to mark equipment Out of Service due to a mechanical failure even if all documents are current.

**QR Code** — preview and download the QR image to attach to the equipment dashboard, control panel, or body.

**Documents** — lists every document on file such as Registration, Insurance, and Annual Inspection. Each document shows its expiry date and a status badge. To add a new document, enter the name and expiry date in the Add document form.

**Last Inspection** — shows the most recent inspection result, date, time, inspector name, and any notes. For example: "Needs Attention — Drill bit worn, replacement due before next shift."

### Equipment QR scan (field view)

Scanning an equipment QR code with a phone opens a mobile page showing the machine name, unit ID, type, and job site, followed by the status banner.

Below the banner, the **Documents** section lists each document with its expiry date and a color-coded icon — green for valid, yellow warning for expiring soon, and red for expired.

The **Last Inspection** card shows the most recent result. If it flagged an issue, the note is visible here so any field user who scans the code sees the same warning.

At the bottom, the **Start Daily Checklist** button opens the pre-use inspection form for that machine. A **View Inspection History** link shows all past inspection records.

---

## 7. Daily Inspection

From the equipment scan page, tap **Start Daily Checklist**. The inspection form opens for that specific machine.

Enter the inspector's name at the top.

The **Pre-Use Checklist** shows up to ten items. Required items are marked with a red asterisk. For each item, tap the checkmark if it passes or the X if it fails. The counter at the top right tracks how many items have been reviewed.

Standard checklist items include:
- Engine oil level
- Hydraulic fluid level
- Coolant level
- Undercarriage and tyres condition
- Attachments and working tools
- Safety devices (backup alarm and lights)
- Fire extinguisher present
- Mirrors and windows clean
- Seat belt functional
- No visible leaks

After completing the checklist, add any **Notes** in the optional text area — for example, observations about unusual wear or a component that needs monitoring.

Use the **Photos** section to attach images of any damage or issues found during the inspection.

Tap **Submit Inspection**. A passed inspection clears the equipment for the shift. A failed or needs-attention result keeps the issue visible to supervisors and mechanics so action can be taken before the next use.

---

## 8. Help

The **Help** page in the top navigation provides an in-app guide covering the Admin workflow and a First Worker Guide for field users who are new to HardHat. If you get stuck at any point, check there first.

---

## 9. Wrap Up

HardHat keeps compliance records in one place and makes field verification fast. Admins add employees and equipment, attach credentials and documents, and print QR codes. Field teams scan QR codes before work starts. Everyone — from the super admin to the newest laborer — can see immediately whether a worker or machine is cleared to operate.
