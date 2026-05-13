# HardHat

**Scan. Verify. Work Safe.**

QR-based compliance verification for construction crews. Instantly verify worker certifications and equipment readiness on any job site.

## Features

- **Employee QR Scan** - Scan a worker's hard hat QR code to see certifications, licenses, and task training status
- **Equipment Verification** - Check registration, insurance, and inspection status before operation
- **Daily Inspections** - Mobile-friendly pre-use checklists with photo capture
- **JHA Sign-off** - Digital Job Hazard Analysis forms with crew acknowledgment
- **Compliance Dashboard** - Overview of expiring certs, today's inspections, and alerts

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/estifanosk/hardhat.git
cd hardhat

# Install dependencies
npm install
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Demo Pages

| Page | URL | Description |
|------|-----|-------------|
| Landing | `/` | Product overview |
| Dashboard | `/dashboard` | Compliance overview with stats |
| Employee (expiring) | `/e/emp-abc123` | Worker with expiring certification |
| Employee (compliant) | `/e/emp-def456` | Fully compliant worker |
| Employee (non-compliant) | `/e/emp-ghi789` | Worker with expired certs |
| Equipment (ready) | `/eq/eq-xyz001` | Equipment cleared for use |
| Equipment (out of service) | `/eq/eq-xyz003` | Equipment with failed inspection |
| Daily Checklist | `/eq/eq-xyz001/inspect` | Pre-use inspection form |
| JHA Sign-off | `/jha/jha-001` | Job Hazard Analysis form |

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── dashboard/            # Compliance dashboard
│   ├── e/[qrCode]/           # Employee scan page
│   ├── eq/[qrCode]/          # Equipment scan page
│   │   └── inspect/          # Daily checklist form
│   └── jha/[id]/             # JHA sign-off page
├── components/ui/            # shadcn/ui components
└── lib/
    └── mock-data.ts          # Sample data for POC
```

## Documentation

- [Product Spec](docs/hardhat_spec.md) - Full product requirements
- [Design Doc](docs/DESIGN_DOC.md) - Technical architecture and implementation plan

## License

Private - All rights reserved
