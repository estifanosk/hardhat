import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, UserCheck, AlertTriangle, XCircle, ChevronRight } from 'lucide-react';

const statusConfig = {
  compliant: { label: 'Compliant', icon: UserCheck, className: 'bg-green-100 text-green-700' },
  expiring_soon: { label: 'Expiring Soon', icon: AlertTriangle, className: 'bg-yellow-100 text-yellow-700' },
  non_compliant: { label: 'Non-Compliant', icon: XCircle, className: 'bg-red-100 text-red-700' },
};

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const { error: paramError } = await searchParams;

  const { data: employees } = await supabase
    .from('employees')
    .select('id, name, role, company, qr_code, overall_status, certifications(count)')
    .order('name');

  const counts = {
    total: employees?.length ?? 0,
    compliant: employees?.filter((e) => e.overall_status === 'compliant').length ?? 0,
    expiring: employees?.filter((e) => e.overall_status === 'expiring_soon').length ?? 0,
    nonCompliant: employees?.filter((e) => e.overall_status === 'non_compliant').length ?? 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="text-sm text-gray-500 mt-0.5">{counts.total} total</p>
        </div>
        <Link href="/admin/employees/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Employee
          </Button>
        </Link>
      </div>

      {paramError && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{paramError}</p>
      )}

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-2xl font-bold text-green-600">{counts.compliant}</p>
            <p className="text-xs text-gray-500 mt-0.5">Compliant</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-2xl font-bold text-yellow-600">{counts.expiring}</p>
            <p className="text-xs text-gray-500 mt-0.5">Expiring Soon</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-2xl font-bold text-red-600">{counts.nonCompliant}</p>
            <p className="text-xs text-gray-500 mt-0.5">Non-Compliant</p>
          </CardContent>
        </Card>
      </div>

      {/* Employee list */}
      <Card>
        <CardContent className="p-0">
          {!employees || employees.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <p>No employees yet.</p>
              <Link href="/admin/employees/new">
                <Button variant="outline" className="mt-3">Add your first employee</Button>
              </Link>
            </div>
          ) : (
            <ul className="divide-y">
              {employees.map((emp) => {
                const s = statusConfig[emp.overall_status as keyof typeof statusConfig];
                const Icon = s.icon;
                const certCount = (emp.certifications as unknown as { count: number }[])[0]?.count ?? 0;
                return (
                  <li key={emp.id}>
                    <Link
                      href={`/admin/employees/${emp.id}`}
                      className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-semibold text-sm">
                          {emp.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{emp.name}</p>
                          <p className="text-sm text-gray-500">
                            {emp.role} · {emp.company} · {certCount} cert{certCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${s.className} gap-1 text-xs`}>
                          <Icon className="h-3 w-3" />
                          {s.label}
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
