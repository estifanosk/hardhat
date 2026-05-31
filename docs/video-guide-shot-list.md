# HardHat Video Guide Shot List

This shot list matches `scripts/record-demo.ts`.

## Recording Setup

Use a seeded demo environment with at least:

- One super admin user with a known email and password.
- At least one employee with certifications.
- At least one equipment record with documents.
- Optional inspection history for the equipment.

Required environment variables:

```bash
GUIDE_EMAIL="admin@example.com"
GUIDE_PASSWORD="password"
```

Optional environment variables:

```bash
GUIDE_BASE_URL="https://hardhat-xi.vercel.app/"
GUIDE_OUTPUT_DIR="artifacts/video-guide"
GUIDE_HEADLESS="false"
GUIDE_SLOW_MO="250"
```

Run:

```bash
npx tsx scripts/record-demo.ts
```

The script writes screenshots and raw Playwright video files to `artifacts/video-guide/`.

## Shot Plan

| Shot | Screen | Purpose | Narration Section |
| --- | --- | --- | --- |
| 01 | `/login` | Show password sign-in entry point | Sign In |
| 02 | `/dashboard` | Show compliance overview | Intro / Sign In |
| 03 | `/admin/users` | Show user creation and role management | User Management |
| 04 | `/admin/employees` | Show employee compliance summary | Employee Compliance |
| 05 | `/admin/employees/new` | Show employee creation form | Employee Compliance |
| 06 | First employee detail | Show QR download and certification management | Employee Compliance |
| 07 | Public employee QR page | Show field scan result | Field QR Scan |
| 08 | `/admin/equipment` | Show equipment compliance summary | Equipment Compliance |
| 09 | `/admin/equipment/new` | Show equipment creation form | Equipment Compliance |
| 10 | First equipment detail | Show equipment docs and QR download | Equipment Compliance |
| 11 | Public equipment QR page | Show equipment scan result | Field QR Scan |
| 12 | Equipment inspection page | Show checklist workflow | Daily Inspection |
| 13 | `/help` | Show in-app help for follow-up learning | Wrap Up |

## Editing Notes

- Use the generated screenshots as fallback stills if a recorded segment is too fast.
- Trim raw video pauses between shots.
- Add section title cards for Admin Setup, Employee Compliance, Equipment Compliance, Field Scan, and Daily Inspection.
- Add captions from `docs/video-guide-script.md`.
- Keep the final export around 4 to 5 minutes.
