import { createServerClient, type CookieOptionsWithName } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

type ResponseCookie = {
  name: string;
  value: string;
  options: CookieOptionsWithName;
};

const createRecoveryClient = createServerClient as unknown as (
  supabaseUrl: string,
  supabaseKey: string,
  options: {
    cookies: {
      getAll(): ReturnType<NextRequest['cookies']['getAll']>;
      setAll(cookies: ResponseCookie[]): void;
    };
  }
) => {
  auth: {
    exchangeCodeForSession(code: string): Promise<{
      data: { user: { id: string } | null };
      error: { message: string } | null;
    }>;
  };
};

function getBaseUrl(request: NextRequest, origin: string) {
  if (process.env.NODE_ENV === 'development') return origin;
  const forwardedHost = request.headers.get('x-forwarded-host');
  return forwardedHost ? `https://${forwardedHost}` : origin;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const base = getBaseUrl(request, origin);
  const cookiesToSet: ResponseCookie[] = [];

  function redirectWithCookies(path: string) {
    const response = NextResponse.redirect(`${base}${path}`);
    cookiesToSet.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options);
    });
    return response;
  }

  if (!code) {
    return redirectWithCookies('/forgot-password?error=Reset+link+expired+or+invalid');
  }

  const supabase = createRecoveryClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(newCookies) {
          cookiesToSet.push(...newCookies);
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) {
    return redirectWithCookies(`/forgot-password?error=${encodeURIComponent(error?.message ?? 'Reset link expired or invalid')}`);
  }

  return redirectWithCookies('/reset-password');
}
