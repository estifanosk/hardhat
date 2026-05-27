import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  Truck,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Clock,
  ClipboardCheck,
  QrCode,
  FileText,
  HardHat,
  ChevronRight,
} from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];
  const todayTime = new Date(today).getTime();

  const [
    { count: totalEmployees },
    { count: totalEquipment },
    { data: expiringCerts },
    { data: expiringDocs },
    { data: todayInspections },
  ] = await Promise.all([
    supabase.from('employees').select('*', { count: 'exact', head: true }),
    supabase.from('equipment').select('*', { count: 'exact', head: true }),
    supabase
      .from('certifications')
      .select('name, status, expiry_date, employees(name)')
      .in('status', ['expiring_soon', 'expired'])
      .order('expiry_date', { ascending: true })
      .limit(10),
    supabase
      .from('equipment_documents')
      .select('name, status, expiry_date, equipment(identifier)')
      .in('status', ['expiring_soon', 'expired'])
      .order('expiry_date', { ascending: true })
      .limit(10),
    supabase
      .from('inspections')
      .select('id, status, equipment(id, name, identifier, qr_code)')
      .eq('inspection_date', today)
      .order('created_at', { ascending: false }),
  ]);

  const getDaysUntilExpiry = (dateStr: string | null) => {
    if (!dateStr) return null;
    return Math.ceil((new Date(dateStr).getTime() - todayTime) / (1000 * 60 * 60 * 24));
  };

  type ExpiringItem = {
    name: string;
    status: string;
    expiry_date: string | null;
    ownerName: string;
    type: 'employee' | 'equipment';
  };

  const allExpiring: ExpiringItem[] = [
    ...(expiringCerts ?? []).map((c) => ({
      name: c.name,
      status: c.status,
      expiry_date: c.expiry_date,
      ownerName: (c.employees as unknown as { name: string } | null)?.name ?? '—',
      type: 'employee' as const,
    })),
    ...(expiringDocs ?? []).map((d) => ({
      name: d.name,
      status: d.status,
      expiry_date: d.expiry_date,
      ownerName: (d.equipment as unknown as { identifier: string } | null)?.identifier ?? '—',
      type: 'equipment' as const,
    })),
  ].sort((a, b) => {
    if (a.status === 'expired' && b.status !== 'expired') return -1;
    if (b.status === 'expired' && a.status !== 'expired') return 1;
    return 0;
  });

  const expiringCount = allExpiring.filter((i) => i.status === 'expiring_soon').length;
  const expiredCount = allExpiring.filter((i) => i.status === 'expired').length;

  type InspectedEquipment = {
    id: string;
    name: string;
    identifier: string;
    qr_code: string;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-orange-500 p-2 rounded-lg">
                <HardHat className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">HardHat</h1>
                <p className="text-xs text-gray-500">Dashboard</p>
              </div>
            </div>
            <Link href="/admin/employees">
              <Badge variant="outline" className="text-xs cursor-pointer hover:bg-gray-50">
                Admin →
              </Badge>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Employees</p>
                  <p className="text-3xl font-bold text-gray-900">{totalEmployees ?? 0}</p>
                </div>
                <Users className="h-10 w-10 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Equipment</p>
                  <p className="text-3xl font-bold text-gray-900">{totalEquipment ?? 0}</p>
                </div>
                <Truck className="h-10 w-10 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Expiring Soon</p>
                  <p className="text-3xl font-bold text-yellow-600">{expiringCount}</p>
                </div>
                <AlertTriangle className="h-10 w-10 text-yellow-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Expired</p>
                  <p className="text-3xl font-bold text-red-600">{expiredCount}</p>
                </div>
                <XCircle className="h-10 w-10 text-red-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Needs Attention */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Needs Attention
              </CardTitle>
            </CardHeader>
            <CardContent>
              {allExpiring.length === 0 ? (
                <div className="flex items-center gap-2 text-green-600 py-2">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-sm font-medium">All certifications and documents are current</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {allExpiring.slice(0, 5).map((item, idx) => {
                    const days = getDaysUntilExpiry(item.expiry_date);
                    return (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-3 rounded-lg ${item.status === 'expired' ? 'bg-red-50' : 'bg-yellow-50'}`}
                      >
                        <div className="flex items-center gap-3">
                          {item.status === 'expired' ? (
                            <XCircle className="h-5 w-5 text-red-500" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{item.ownerName}</p>
                            <p className="text-sm text-gray-500">{item.name}</p>
                          </div>
                        </div>
                        <Badge
                          variant={item.status === 'expired' ? 'destructive' : 'outline'}
                          className={item.status !== 'expired' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : ''}
                        >
                          {item.status === 'expired'
                            ? `Expired ${Math.abs(days ?? 0)}d ago`
                            : `${days}d left`}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Today's Inspections */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5" />
                Today&apos;s Inspections
                <span className="text-sm font-normal text-gray-400">({todayInspections?.length ?? 0})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!todayInspections || todayInspections.length === 0 ? (
                <div className="flex items-center gap-2 text-gray-400 py-2">
                  <Clock className="h-5 w-5" />
                  <span className="text-sm">No inspections recorded today</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {todayInspections.map((insp) => {
                    const eq = insp.equipment as unknown as InspectedEquipment | null;
                    if (!eq) return null;
                    return (
                      <Link
                        key={insp.id}
                        href={`/eq/${eq.qr_code}`}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {insp.status === 'passed' ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{eq.identifier}</p>
                            <p className="text-sm text-gray-500">{eq.name}</p>
                          </div>
                        </div>
                        <Badge
                          className={insp.status === 'passed' ? 'bg-green-100 text-green-700' : ''}
                          variant={insp.status === 'failed' ? 'destructive' : 'default'}
                        >
                          {insp.status}
                        </Badge>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
              <Link href="/admin/employees">
                <Button variant="outline" className="w-full justify-between h-auto py-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Manage Employees</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/admin/equipment">
                <Button variant="outline" className="w-full justify-between h-auto py-3">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    <span>Manage Equipment</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/admin/employees/new">
                <Button variant="outline" className="w-full justify-between h-auto py-3">
                  <div className="flex items-center gap-2">
                    <QrCode className="h-4 w-4" />
                    <span>Add Employee</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/admin/equipment/new">
                <Button variant="outline" className="w-full justify-between h-auto py-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>Add Equipment</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-gray-400 pt-4 pb-8">
          <p>HardHat — Scan. Verify. Work Safe.</p>
        </div>
      </main>
    </div>
  );
}
