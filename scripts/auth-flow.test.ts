import assert from 'node:assert/strict';
import test from 'node:test';
import type { NextRequest } from 'next/server';
import { handleAuthCallback } from '../src/app/auth/callback/route';
import { getRoleHome } from '../src/lib/auth/role-home';
import { getSiteUrlFromHeaders } from '../src/lib/auth/site-url';

type CookieToSet = {
  name: string;
  value: string;
  options: Record<string, unknown>;
};

function makeRequest(url: string, headers = new Headers()) {
  return {
    url,
    headers,
    cookies: {
      getAll: () => [],
    },
  } as unknown as NextRequest;
}

test('builds the magic-link redirect URL from deployment headers', () => {
  const headers = new Headers({
    host: 'hardhat-xi.vercel.app',
    'x-forwarded-proto': 'https',
  });

  assert.equal(`${getSiteUrlFromHeaders(headers)}/auth/callback`, 'https://hardhat-xi.vercel.app/auth/callback');
});

test('prefers NEXT_PUBLIC_APP_URL when it is configured', () => {
  const headers = new Headers({
    host: 'preview-hardhat.vercel.app',
    'x-forwarded-proto': 'https',
  });

  assert.equal(
    `${getSiteUrlFromHeaders(headers, 'https://hardhat.example.com/')}/auth/callback`,
    'https://hardhat.example.com/auth/callback'
  );
});

test('exchanges a magic-link code, sets auth cookies, and redirects by role', async () => {
  const calls: string[] = [];

  const response = await handleAuthCallback(
    makeRequest('https://hardhat-xi.vercel.app/auth/callback?code=test-code'),
    (_request, cookiesToSet: CookieToSet[]) => {
      cookiesToSet.push({
        name: 'sb-test-auth-token',
        value: 'session-value',
        options: { path: '/', httpOnly: true },
      });

      return {
        auth: {
          async exchangeCodeForSession(code: string) {
            calls.push(`exchange:${code}`);
            return { data: { user: { id: 'user-1' } }, error: null };
          },
          async verifyOtp() {
            throw new Error('verifyOtp should not be called for code callbacks');
          },
        },
        from(table: string) {
          calls.push(`from:${table}`);
          return {
            select(columns: string) {
              calls.push(`select:${columns}`);
              return {
                eq(column: string, value: string) {
                  calls.push(`eq:${column}:${value}`);
                  return {
                    async single() {
                      return { data: { role: 'safety_admin' } };
                    },
                  };
                },
              };
            },
          };
        },
      };
    }
  );

  assert.equal(response.status, 307);
  assert.equal(response.headers.get('location'), 'https://hardhat-xi.vercel.app/admin/employees');
  assert.match(response.headers.get('set-cookie') ?? '', /sb-test-auth-token=session-value/);
  assert.deepEqual(calls, ['exchange:test-code', 'from:profiles', 'select:role', 'eq:id:user-1']);
});

test('redirects signed-in viewers to dashboard instead of login', () => {
  assert.equal(getRoleHome('viewer'), '/dashboard');
  assert.equal(getRoleHome(undefined), '/dashboard');
});

test('invalid callback links go back to login with an error', async () => {
  const response = await handleAuthCallback(
    makeRequest('https://hardhat-xi.vercel.app/auth/callback'),
    () => {
      throw new Error('Supabase should not be initialized when callback params are missing');
    }
  );

  assert.equal(response.status, 307);
  assert.equal(response.headers.get('location'), 'https://hardhat-xi.vercel.app/login?error=Link+expired+or+invalid');
});
