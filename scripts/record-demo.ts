import { chromium, type Page } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

type Shot = {
  name: string;
  url?: string;
  action?: (page: Page) => Promise<void>;
};

const baseUrl = process.env.GUIDE_BASE_URL ?? 'https://hardhat-xi.vercel.app/';
const email = process.env.GUIDE_EMAIL;
const password = process.env.GUIDE_PASSWORD;
const outputDir = process.env.GUIDE_OUTPUT_DIR ?? 'artifacts/video-guide';
const headless = process.env.GUIDE_HEADLESS !== 'false';
const slowMo = Number(process.env.GUIDE_SLOW_MO ?? '250');

function fail(message: string): never {
  console.error(`Error: ${message}`);
  process.exit(1);
}

if (!email || !password) {
  fail('Set GUIDE_EMAIL and GUIDE_PASSWORD before running the recording script.');
}

function appUrl(pathname: string) {
  return new URL(pathname, baseUrl).toString();
}

async function pause(page: Page, milliseconds = 1200) {
  await page.waitForLoadState('networkidle').catch(() => undefined);
  await page.waitForTimeout(milliseconds);
}

async function screenshot(page: Page, index: number, name: string) {
  const safeName = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  await page.screenshot({
    path: path.join(outputDir, 'screenshots', `${String(index).padStart(2, '0')}-${safeName}.png`),
    fullPage: true,
  });
}

async function clickIfVisible(page: Page, role: Parameters<Page['getByRole']>[0], name: RegExp | string) {
  const target = page.getByRole(role, { name }).first();
  if (await target.isVisible().catch(() => false)) {
    await target.click();
    await pause(page);
    return true;
  }
  return false;
}

async function firstHref(page: Page, selector: string) {
  return page.locator(selector).first().getAttribute('href').catch(() => null);
}

async function login(page: Page) {
  await page.goto(appUrl('/login'));
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 15000 });
  await pause(page);
}

async function goToFirstEmployeeDetail(page: Page) {
  await page.goto(appUrl('/admin/employees'));
  await pause(page);
  const href = await firstHref(page, 'a[href^="/admin/employees/"]:not([href$="/new"])');
  if (href) {
    await page.goto(appUrl(href));
    await pause(page);
  }
}

async function goToFirstEmployeeQr(page: Page) {
  const href = await firstHref(page, 'a[href^="/e/"]');
  if (href) {
    await page.goto(appUrl(href));
    await pause(page);
    return;
  }

  await page.goto(appUrl('/e/emp-abc123'));
  await pause(page);
}

async function goToFirstEquipmentDetail(page: Page) {
  await page.goto(appUrl('/admin/equipment'));
  await pause(page);
  const href = await firstHref(page, 'a[href^="/admin/equipment/"]:not([href$="/new"])');
  if (href) {
    await page.goto(appUrl(href));
    await pause(page);
  }
}

async function goToFirstEquipmentQr(page: Page) {
  const href = await firstHref(page, 'a[href^="/eq/"]');
  if (href) {
    await page.goto(appUrl(href));
    await pause(page);
    return;
  }

  await page.goto(appUrl('/eq/eq-xyz001'));
  await pause(page);
}

async function goToInspection(page: Page) {
  await clickIfVisible(page, 'link', /run inspection/i);
  if (!page.url().includes('/inspect')) {
    const current = new URL(page.url());
    await page.goto(`${current.origin}${current.pathname}/inspect`);
    await pause(page);
  }
}

const shots: Shot[] = [
  { name: 'Login', url: '/login' },
  { name: 'Dashboard', url: '/dashboard' },
  { name: 'User Management', url: '/admin/users' },
  { name: 'Employees', url: '/admin/employees' },
  { name: 'Add Employee', url: '/admin/employees/new' },
  { name: 'Employee Detail', action: goToFirstEmployeeDetail },
  { name: 'Employee QR Scan', action: goToFirstEmployeeQr },
  { name: 'Equipment', url: '/admin/equipment' },
  { name: 'Add Equipment', url: '/admin/equipment/new' },
  { name: 'Equipment Detail', action: goToFirstEquipmentDetail },
  { name: 'Equipment QR Scan', action: goToFirstEquipmentQr },
  { name: 'Daily Inspection', action: goToInspection },
  { name: 'Help Guide', url: '/help' },
];

async function main() {
  await fs.mkdir(path.join(outputDir, 'screenshots'), { recursive: true });
  await fs.mkdir(path.join(outputDir, 'videos'), { recursive: true });

  const browser = await chromium.launch({ headless, slowMo });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    recordVideo: {
      dir: path.join(outputDir, 'videos'),
      size: { width: 1440, height: 1000 },
    },
  });
  const page = await context.newPage();

  await login(page);

  for (const [index, shot] of shots.entries()) {
    if (shot.url) {
      await page.goto(appUrl(shot.url));
      await pause(page);
    }

    if (shot.action) {
      await shot.action(page);
    }

    await screenshot(page, index + 1, shot.name);
    console.log(`Captured ${shot.name}`);
  }

  await context.close();
  await browser.close();

  console.log(`Recording artifacts written to ${outputDir}`);
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : String(error));
});
