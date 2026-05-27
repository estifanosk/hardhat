import { sendMagicLink } from './actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { isMagicLinkAuthEnabled } from '@/lib/auth/feature-flags';
import { HardHat, MailCheck, ShieldAlert } from 'lucide-react';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string; email?: string }>;
}) {
  const { error, sent, email } = await searchParams;
  const magicLinkEnabled = isMagicLinkAuthEnabled();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2">
          <div className="bg-orange-500 p-3 rounded-xl">
            <HardHat className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">HardHat</h1>
          <p className="text-sm text-gray-500">Sign in to manage your crew</p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Sign in</CardTitle>
          </CardHeader>
          <CardContent>
            {!magicLinkEnabled ? (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <ShieldAlert className="h-10 w-10 text-orange-500" />
                <p className="font-medium text-gray-900">Sign-in is temporarily disabled</p>
                <p className="text-sm text-gray-500">
                  Magic link access is turned off while we finish production authentication setup.
                </p>
                {error && (
                  <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
                    {error}
                  </p>
                )}
              </div>
            ) : sent ? (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <MailCheck className="h-10 w-10 text-green-500" />
                <p className="font-medium text-gray-900">Check your email</p>
                <p className="text-sm text-gray-500">
                  We sent a sign-in link to <span className="font-medium">{email}</span>.
                  Tap it to continue — no password needed.
                </p>
              </div>
            ) : (
              <form action={sendMagicLink} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@company.com"
                    required
                    autoComplete="email"
                  />
                  <p className="text-xs text-gray-400">
                    We&apos;ll send a one-click sign-in link to your inbox.
                  </p>
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
                    {error}
                  </p>
                )}

                <Button type="submit" className="w-full">
                  Send sign-in link
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
