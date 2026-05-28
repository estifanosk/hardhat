import { headers } from 'next/headers';

export async function getSiteUrl() {
  const headersList = await headers();
  const origin = headersList.get('origin');
  if (origin) return origin;

  const forwardedHost = headersList.get('x-forwarded-host');
  const host = forwardedHost ?? headersList.get('host');
  if (!host) return 'http://localhost:3000';

  const forwardedProto = headersList.get('x-forwarded-proto');
  const proto = forwardedProto ?? (host.includes('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}
