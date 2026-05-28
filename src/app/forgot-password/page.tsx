import Link from 'next/link';
import { requestPasswordReset } from './actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { HardHat, MailCheck } from 'lucide-react';

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string; email?: string }>;
}) {
  const { error, sent, email } = await searchParams;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2">
          <div className="bg-orange-500 p-3 rounded-xl">
            <HardHat className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">HardHat</h1>
          <p className="text-sm text-gray-500">Reset your password</p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Forgot password</CardTitle>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <MailCheck className="h-10 w-10 text-green-500" />
                <p className="font-medium text-gray-900">Check your email</p>
                <p className="text-sm text-gray-500">
                  We sent a password reset link to <span className="font-medium">{email}</span>.
                </p>
                <Link href="/login" className="text-sm text-orange-600 hover:underline">
                  Back to sign in
                </Link>
              </div>
            ) : (
              <form action={requestPasswordReset} className="space-y-4">
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
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
                    {error}
                  </p>
                )}

                <Button type="submit" className="w-full">
                  Send reset link
                </Button>

                <Link href="/login" className="block text-center text-sm text-gray-500 hover:text-gray-900">
                  Back to sign in
                </Link>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
