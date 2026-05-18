/**
 * Run a SQL migration file against Supabase.
 *
 * ─── SETUP (one time) ────────────────────────────────────────────────────────
 *
 *  1. Get your access token:
 *     - Go to https://supabase.com/dashboard
 *     - Click your avatar (top-right) → Access Tokens
 *     - Click "Generate new token", name it (e.g. "hardhat-cli"), copy it
 *
 *  2. Set it in your terminal:
 *     export SUPABASE_ACCESS_TOKEN=your_token_here
 *
 *     Tip: add that line to your ~/.zshrc so you don't have to repeat it.
 *
 * ─── USAGE ───────────────────────────────────────────────────────────────────
 *
 *  npm run db supabase/migrations/001_rbac.sql
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import * as fs from 'fs';
import * as path from 'path';

const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const PROJECT_REF = 'vqoyuawnvxjxmymwnjfb';

if (!ACCESS_TOKEN) {
  console.error('❌  SUPABASE_ACCESS_TOKEN is not set.');
  console.error('   Run: export SUPABASE_ACCESS_TOKEN=your_token_here');
  process.exit(1);
}

const filePath = process.argv[2];

if (!filePath) {
  console.error('❌  No file provided.');
  console.error('   Usage: npm run db supabase/migrations/001_rbac.sql');
  process.exit(1);
}

const resolved = path.resolve(filePath);

if (!fs.existsSync(resolved)) {
  console.error(`❌  File not found: ${resolved}`);
  process.exit(1);
}

const sql = fs.readFileSync(resolved, 'utf-8');
console.log(`▶  Running ${path.basename(resolved)} ...`);

const res = await fetch(
  `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  }
);

const body = await res.json();

if (!res.ok) {
  console.error('❌  Migration failed:');
  console.error(JSON.stringify(body, null, 2));
  process.exit(1);
}

console.log('✅  Migration applied successfully.');
