import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, CheckCircle2, AlertTriangle, XCircle, ChevronRight } from 'lucide-react';

const statusConfig = {
  ready: { label: 'Ready', icon: CheckCircle2, className: 'bg-green-100 text-green-700' },
  needs_inspection: { label: 'Needs Inspection', icon: AlertTriangle, className: 'bg-yellow-100 text-yellow-700' },
  out_of_service: { label: 'Out of Service', icon: XCircle, className: 'bg-red-100 text-red-700' },
};

export default async function EquipmentListPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const { error: paramError } = await searchParams;

  const { data: equipmentList } = await supabase
    .from('equipment')
    .select('id, name, type, identifier, site, qr_code, overall_status, equipment_documents(count)')
    .order('name');

  const counts = {
    total: equipmentList?.length ?? 0,
    ready: equipmentList?.filter((e) => e.overall_status === 'ready').length ?? 0,
    needs: equipmentList?.filter((e) => e.overall_status === 'needs_inspection').length ?? 0,
    outOfService: equipmentList?.filter((e) => e.overall_status === 'out_of_service').length ?? 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Equipment</h1>
          <p className="text-sm text-gray-500 mt-0.5">{counts.total} total</p>
        </div>
        <Link href="/admin/equipment/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Equipment
          </Button>
        </Link>
      </div>

      {paramError && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{paramError}</p>
      )}

      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-4 pb-3"><p className="text-2xl font-bold text-green-600">{counts.ready}</p><p className="text-xs text-gray-500 mt-0.5">Ready</p></CardContent></Card>
        <Card><CardContent className="pt-4 pb-3"><p className="text-2xl font-bold text-yellow-600">{counts.needs}</p><p className="text-xs text-gray-500 mt-0.5">Needs Inspection</p></CardContent></Card>
        <Card><CardContent className="pt-4 pb-3"><p className="text-2xl font-bold text-red-600">{counts.outOfService}</p><p className="text-xs text-gray-500 mt-0.5">Out of Service</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-0">
          {!equipmentList || equipmentList.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <p>No equipment yet.</p>
              <Link href="/admin/equipment/new">
                <Button variant="outline" className="mt-3">Add your first equipment</Button>
              </Link>
            </div>
          ) : (
            <ul className="divide-y">
              {equipmentList.map((eq) => {
                const s = statusConfig[eq.overall_status as keyof typeof statusConfig];
                const Icon = s.icon;
                const docCount = (eq.equipment_documents as unknown as { count: number }[])[0]?.count ?? 0;
                return (
                  <li key={eq.id}>
                    <Link
                      href={`/admin/equipment/${eq.id}`}
                      className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                          {eq.type.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{eq.name}</p>
                          <p className="text-sm text-gray-500">
                            {eq.identifier} · {eq.site} · {docCount} doc{docCount !== 1 ? 's' : ''}
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
