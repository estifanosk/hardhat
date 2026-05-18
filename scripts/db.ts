/**
 * Run a SQL file or inline query against Supabase.
 *
 * Usage:
 *   npx tsx scripts/db.ts <path-to-sql-file>
 *   npx tsx scripts/db.ts "SELECT * FROM profiles"
 *
 * Requires SUPABASE_ACCESS_TOKEN in your environment.
 * Get one from: Supabase Dashboard → Account → Access Tokens
 *
 *   export SUPABASE_ACCESS_TOKEN=your_token_here
 */

import * as fs from 'fs';
import * as path from 'path';

const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const PROJECT_REF = 'vqoyuawnvxjxmymwnjfb';

if (!ACCESS_TOKEN) {
  console.error('❌  SUPABASE_ACCESS_TOKEN is not set.');
  console.error('   export SUPABASE_ACCESS_TOKEN=your_token_here');
  process.exit(1);
}

const input = process.argv[2];

if (!input) {
  console.error('❌  No SQL provided.');
  console.error('   Usage: npx tsx scripts/db.ts <file.sql>');
  console.error('          npx tsx scripts/db.ts "SELECT * FROM profiles"');
  process.exit(1);
}

// If the argument looks like a file path, read it. Otherwise treat it as inline SQL.
let sql: string;
if (input.endsWith('.sql') || fs.existsSync(input)) {
  const filePath = path.resolve(input);
  sql = fs.readFileSync(filePath, 'utf-8');
  console.log(`▶  Running ${path.basename(filePath)} ...`);
} else {
  sql = input;
  console.log(`▶  Running inline query ...`);
}

async function run() {
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
    console.error('❌  Query failed:');
    console.error(JSON.stringify(body, null, 2));
    process.exit(1);
  }

  if (Array.isArray(body) && body.length > 0) {
    console.table(body);
  } else {
    console.log('✅  Done.');
  }
}

run();
