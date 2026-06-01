import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users, Truck, AlertTriangle, XCircle, CheckCircle2,
  Clock, ClipboardCheck, ChevronRight,
} from 'lucide-react';

export default async function AdminDashboard() {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];

  const [
    { count: totalEmployees },
    { count: totalEquipment },
    { count: empExpiring },
    { count: empNonCompliant },
    { count: eqReady },
    { count: eqNeeds },
    { count: eqOutOfService },
    { data: expiringCerts },
    { data: expiringDocs },
    { data: todayInspections },
    { data: allEquipment },
  ] = await Promise.all([
    supabase.from('employees').select('id', { count: 'exact', head: true }),
    supabase.from('equipment').select('id', { count: 'exact', head: true }),
    supabase.from('employees').select('id', { count: 'exact', head: true }).eq('overall_status', 'expiring_soon'),
    supabase.from('employees').select('id', { count: 'exact', head: true }).eq('overall_status', 'non_compliant'),
    supabase.from('equipment').select('id', { count: 'exact', head: true }).eq('overall_status', 'ready'),
    supabase.from('equipment').select('id', { count: 'exact', head: true }).eq('overall_status', 'needs_inspection'),
    supabase.from('equipment').select('id', { count: 'exact', head: true }).eq('overall_status', 'out_of_service'),
    supabase
      .from('certifications')
      .select('id, name, status, expiry_date, employee_id, employees(id, name)')
      .in('status', ['expiring_soon', 'expired'])
      .order('expiry_date', { ascending: true })
      .limit(8),
    supabase
      .from('equipment_documents')
      .select('id, name, status, expiry_date, equipment_id, equipment(id, name, identifier)')
      .in('status', ['expiring_soon', 'expired'])
      .order('expiry_date', { ascending: true })
      .limit(8),
    supabase
      .from('inspections')
      .select('id, status, inspector_name, equipment_id')
      .eq('inspection_date', today),
    supabase
      .from('equipment')
      .select('id, name, identifier')
      .order('name'),
  ]);

  const attentionItems = [
    ...(expiringCerts ?? []).map((c) => ({
      id: c.id,
      kind: 'employee' as const,
      linkId: (c.employees as unknown as { id: string; name: string } | null)?.id,
      ownerName: (c.employees as unknown as { id: string; name: string } | null)?.name ?? '—',
      itemName: c.name,
      status: c.status as 'expiring_soon' | 'expired',
      expiryDate: c.expiry_date,
    })),
    ...(expiringDocs ?? []).map((d) => ({
      id: d.id,
      kind: 'equipment' as const,
      linkId: (d.equipment as unknown as { id: string; name: string; identifier: string } | null)?.id,
      ownerName: (d.equipment as unknown as { id: string; name: string; identifier: string } | null)?.name ?? '—',
      itemName: d.name,
      status: d.status as 'expiring_soon' | 'expired',
      expiryDate: d.expiry_date,
    })),
  ]
    .sort((a, b) => {
      if (a.status === 'expired' && b.status !== 'expired') return -1;
      if (b.status === 'expired' && a.status !== 'expired') return 1;
      return (a.expiryDate ?? '').localeCompare(b.expiryDate ?? '');
    })
    .slice(0, 8);

  const inspectedIds = new Set((todayInspections ?? []).map((i) => i.equipment_id));
  const inspectionMap = new Map(
    (todayInspections ?? []).map((i) => [i.equipment_id, i])
  );

  const getDaysUntil = (dateStr: string | null) => {
    if (!dateStr) return null;
    return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const empAlerts = (empExpiring ?? 0) + (empNonCompliant ?? 0);
  const eqAlerts = (eqNeeds ?? 0) + (eqOutOfService ?? 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/admin/employees">
          <Card className="hover:border-orange-200 transition-colors cursor-pointer">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900">{totalEmployees ?? 0}</p>
                  <p className="text-sm text-gray-500 mt-0.5">Employees</p>
                </div>
                <Users className="h-8 w-8 text-blue-400 mt-1" />
              </div>
              {empAlerts > 0 && (
                <p className="text-xs text-red-600 mt-2 font-medium">{empAlerts} need attention</p>
              )}
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/equipment">
          <Card className="hover:border-orange-200 transition-colors cursor-pointer">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900">{totalEquipment ?? 0}</p>
                  <p className="text-sm text-gray-500 mt-0.5">Equipment</p>
                </div>
                <Truck className="h-8 w-8 text-green-400 mt-1" />
              </div>
              {eqAlerts > 0 && (
                <p className="text-xs text-red-600 mt-2 font-medium">{eqAlerts} need attention</p>
              )}
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-3xl font-bold text-yellow-600">{(empExpiring ?? 0) + (eqNeeds ?? 0)}</p>
                <p className="text-sm text-gray-500 mt-0.5">Expiring Soon</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-400 mt-1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-3xl font-bold text-red-600">{(empNonCompliant ?? 0) + (eqOutOfService ?? 0)}</p>
                <p className="text-sm text-gray-500 mt-0.5">Expired / Out of Service</p>
              </div>
              <XCircle className="h-8 w-8 text-red-400 mt-1" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee & Equipment breakdown */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-5 pb-4">
            <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" /> Employee Status
            </p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Compliant</span>
                <span className="text-sm font-semibold text-green-700">
                  {(totalEmployees ?? 0) - (empExpiring ?? 0) - (empNonCompliant ?? 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Expiring Soon</span>
                <span className="text-sm font-semibold text-yellow-700">{empExpiring ?? 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Non-Compliant</span>
                <span className="text-sm font-semibold text-red-700">{empNonCompliant ?? 0}</span>
              </div>
            </div>
            <Link href="/admin/employees" className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 mt-3 font-medium">
              View all employees <ChevronRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-4">
            <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Truck className="h-4 w-4 text-green-500" /> Equipment Status
            </p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Ready</span>
                <span className="text-sm font-semibold text-green-700">{eqReady ?? 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Needs Inspection</span>
                <span className="text-sm font-semibold text-yellow-700">{eqNeeds ?? 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Out of Service</span>
                <span className="text-sm font-semibold text-red-700">{eqOutOfService ?? 0}</span>
              </div>
            </div>
            <Link href="/admin/equipment" className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 mt-3 font-medium">
              View all equipment <ChevronRight className="h-3 w-3" />
            </Link>
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
          <CardContent className="pt-0">
            {attentionItems.length === 0 ? (
              <div className="py-6 text-center text-gray-400 text-sm">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-300" />
                All certifications and documents are current.
              </div>
            ) : (
              <div className="space-y-2">
                {attentionItems.map((item) => {
                  const days = getDaysUntil(item.expiryDate);
                  const href = item.kind === 'employee'
                    ? `/admin/employees/${item.linkId}`
                    : `/admin/equipment/${item.linkId}`;
                  return (
                    <Link
                      key={`${item.kind}-${item.id}`}
                      href={href}
                      className={`flex items-center justify-between p-3 rounded-lg transition-colors hover:opacity-90 ${
                        item.status === 'expired' ? 'bg-red-50' : 'bg-yellow-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {item.status === 'expired'
                          ? <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                          : <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />
                        }
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">{item.ownerName}</p>
                          <p className="text-xs text-gray-500 truncate">{item.itemName}</p>
                        </div>
                      </div>
                      <div className="shrink-0 ml-2 text-right">
                        <Badge
                          className={`text-xs ${item.status === 'expired'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {item.status === 'expired'
                            ? days !== null ? `${Math.abs(days)}d ago` : formatDate(item.expiryDate)
                            : days !== null ? `${days}d left` : formatDate(item.expiryDate)
                          }
                        </Badge>
                      </div>
                    </Link>
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
              <ClipboardCheck className="h-5 w-5 text-gray-500" />
              Today&apos;s Inspections
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {!allEquipment || allEquipment.length === 0 ? (
              <div className="py-6 text-center text-gray-400 text-sm">No equipment registered yet.</div>
            ) : (
              <div className="space-y-2">
                {allEquipment.slice(0, 8).map((eq) => {
                  const insp = inspectionMap.get(eq.id);
                  const done = inspectedIds.has(eq.id);
                  return (
                    <div
                      key={eq.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {done
                          ? insp?.status === 'passed'
                            ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                            : <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                          : <Clock className="h-4 w-4 text-gray-400 shrink-0" />
                        }
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">{eq.name}</p>
                          <p className="text-xs text-gray-500">{eq.identifier}</p>
                        </div>
                      </div>
                      <Badge
                        className={`text-xs shrink-0 ml-2 ${
                          !done ? 'bg-gray-100 text-gray-600' :
                          insp?.status === 'passed' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}
                      >
                        {!done ? 'Pending' : insp?.status === 'passed' ? 'Passed' : 'Failed'}
                      </Badge>
                    </div>
                  );
                })}
                {(allEquipment.length > 8) && (
                  <Link href="/admin/equipment" className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 pt-1 font-medium">
                    +{allEquipment.length - 8} more <ChevronRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
