/**
 * Captures screenshots of the live app for the help page.
 *
 * Usage:
 *   1. Make sure you are signed in on hardhat-xi.vercel.app in Chrome
 *   2. Export your session cookies:
 *        npx playwright open https://hardhat-xi.vercel.app --save-storage=auth.json
 *      Sign in when the browser opens, then close it.
 *   3. Run:
 *        npx tsx scripts/screenshots.ts
 *
 * Screenshots land in public/screenshots/ and are picked up automatically
 * by the help page <Image> tags.
 */

import { chromium } from 'playwright';
import path from 'path';

const BASE = 'https://hardhat-xi.vercel.app';
const OUT = path.resolve('public/screenshots');

const shots: { name: string; url: string; clip?: { x: number; y: number; width: number; height: number } }[] = [
  { name: 'admin-employees', url: `${BASE}/admin/employees` },
  { name: 'admin-add-employee', url: `${BASE}/admin/employees/new` },
  { name: 'admin-equipment', url: `${BASE}/admin/equipment` },
];

async function run() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    storageState: 'auth.json',
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  for (const shot of shots) {
    console.log(`📸 ${shot.name}`);
    await page.goto(shot.url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    const opts = shot.clip
      ? { path: `${OUT}/${shot.name}.png`, clip: shot.clip }
      : { path: `${OUT}/${shot.name}.png` };
    await page.screenshot(opts);
  }

  await browser.close();
  console.log('✅ Screenshots saved to public/screenshots/');
}

run().catch((e) => { console.error(e); process.exit(1); });
