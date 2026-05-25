import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, ClipboardCheck, Shield } from 'lucide-react';

export default async function EmployeePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user!.id)
    .single();

  const { data: employee } = await supabase
    .from('employees')
    .select('id, name, role, company, overall_status, qr_code')
    .eq('profile_id', user!.id)
    .maybeSingle();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          Welcome, {profile?.full_name || profile?.email}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Your HardHat portal</p>
      </div>

      <div className="grid gap-4">
        {employee ? (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                Your compliance profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500 text-xs">Name</p>
                  <p className="font-medium">{employee.name}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Role</p>
                  <p className="font-medium">{employee.role}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Company</p>
                  <p className="font-medium">{employee.company}</p>
                </div>
              </div>
              <Link href={`/e/${employee.qr_code}`} target="_blank">
                <Button variant="outline" size="sm" className="gap-1.5 w-full">
                  <Shield className="h-3.5 w-3.5" />
                  View my certifications
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-6 text-center space-y-2">
              <QrCode className="h-8 w-8 text-gray-300 mx-auto" />
              <p className="text-sm font-medium text-gray-700">No employee profile linked yet</p>
              <p className="text-xs text-gray-400">
                Ask your admin to link your account to your employee record.
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4" />
              Daily inspections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-3">
              Scan any equipment QR code to start a daily inspection checklist.
            </p>
            <Link href="/help#field">
              <Button variant="outline" size="sm">How to scan equipment</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
