import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, UserCheck, AlertTriangle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 10;

const statusConfig = {
  compliant: { label: 'Compliant', icon: UserCheck, className: 'bg-green-100 text-green-700' },
  expiring_soon: { label: 'Expiring Soon', icon: AlertTriangle, className: 'bg-yellow-100 text-yellow-700' },
  non_compliant: { label: 'Non-Compliant', icon: XCircle, className: 'bg-red-100 text-red-700' },
};

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; page?: string }>;
}) {
  const supabase = await createClient();
  const { error: paramError, page: pageParam } = await searchParams;
  const requestedPage = Number.parseInt(pageParam ?? '1', 10);
  const parsedPage = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const [
    { count: totalCount },
    { count: compliantCount },
    { count: expiringCount },
    { count: nonCompliantCount },
  ] = await Promise.all([
    supabase.from('employees').select('id', { count: 'exact', head: true }),
    supabase.from('employees').select('id', { count: 'exact', head: true }).eq('overall_status', 'compliant'),
    supabase.from('employees').select('id', { count: 'exact', head: true }).eq('overall_status', 'expiring_soon'),
    supabase.from('employees').select('id', { count: 'exact', head: true }).eq('overall_status', 'non_compliant'),
  ]);

  const counts = {
    total: totalCount ?? 0,
    compliant: compliantCount ?? 0,
    expiring: expiringCount ?? 0,
    nonCompliant: nonCompliantCount ?? 0,
  };
  const totalPages = Math.max(1, Math.ceil(counts.total / PAGE_SIZE));
  const currentPage = Math.min(parsedPage, totalPages);
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const pageStart = counts.total === 0 ? 0 : from + 1;
  const pageEnd = Math.min(to + 1, counts.total);
  const makePageHref = (page: number) => `/admin/employees?page=${page}`;

  const { data: employees } = await supabase
    .from('employees')
    .select('id, name, role, company, qr_code, overall_status, certifications(count)')
    .order('name')
    .range(from, to);

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

      {counts.total > PAGE_SIZE && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">
            Showing {pageStart}-{pageEnd} of {counts.total}
          </p>
          <div className="flex items-center gap-2">
            {currentPage > 1 ? (
              <Link href={makePageHref(currentPage - 1)}>
                <Button variant="outline" size="sm" className="gap-1">
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
              </Link>
            ) : (
              <Button variant="outline" size="sm" className="gap-1" disabled>
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
            )}
            <span className="min-w-20 text-center text-sm text-gray-600">
              Page {Math.min(currentPage, totalPages)} of {totalPages}
            </span>
            {currentPage < totalPages ? (
              <Link href={makePageHref(currentPage + 1)}>
                <Button variant="outline" size="sm" className="gap-1">
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Button variant="outline" size="sm" className="gap-1" disabled>
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
