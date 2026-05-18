import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, XCircle, ExternalLink } from 'lucide-react';

const statusConfig = {
  compliant: { label: 'Compliant', icon: CheckCircle2, className: 'bg-green-100 text-green-700' },
  expiring_soon: { label: 'Expiring Soon', icon: AlertTriangle, className: 'bg-yellow-100 text-yellow-700' },
  non_compliant: { label: 'Non-Compliant', icon: XCircle, className: 'bg-red-100 text-red-700' },
};

export default async function ForemanEmployeesPage() {
  const supabase = await createClient();

  const { data: employees } = await supabase
    .from('employees')
    .select('id, name, role, company, overall_status, qr_code')
    .order('name');

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Crew Compliance</h1>
        <p className="text-sm text-gray-500 mt-0.5">View compliance status for all workers. Scan a QR code or tap a name for details.</p>
      </div>

      {(!employees || employees.length === 0) && (
        <Card>
          <CardContent className="py-12 text-center text-gray-400">
            No employees found.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3">
        {(employees ?? []).map((emp) => {
          const status = statusConfig[emp.overall_status as keyof typeof statusConfig] ?? statusConfig.compliant;
          const Icon = status.icon;
          return (
            <Card key={emp.id} className="hover:border-orange-200 transition-colors">
              <CardContent className="py-3 px-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${emp.overall_status === 'compliant' ? 'text-green-500' : emp.overall_status === 'expiring_soon' ? 'text-yellow-500' : 'text-red-500'}`} />
                  <div>
                    <p className="font-medium text-gray-900">{emp.name}</p>
                    <p className="text-xs text-gray-500">{emp.role} · {emp.company}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs ${status.className}`}>{status.label}</Badge>
                  <Link href={`/e/${emp.qr_code}`} target="_blank">
                    <ExternalLink className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
