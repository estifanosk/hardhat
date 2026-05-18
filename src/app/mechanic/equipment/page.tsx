import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertTriangle, XCircle, ClipboardCheck, ExternalLink } from 'lucide-react';

const statusConfig = {
  ready: { label: 'Ready', icon: CheckCircle2, className: 'bg-green-100 text-green-700', iconClass: 'text-green-500' },
  needs_inspection: { label: 'Needs Inspection', icon: AlertTriangle, className: 'bg-yellow-100 text-yellow-700', iconClass: 'text-yellow-500' },
  out_of_service: { label: 'Out of Service', icon: XCircle, className: 'bg-red-100 text-red-700', iconClass: 'text-red-500' },
};

export default async function MechanicEquipmentPage() {
  const supabase = await createClient();

  const { data: equipment } = await supabase
    .from('equipment')
    .select('id, name, type, identifier, site, overall_status, qr_code, updated_at')
    .order('overall_status') // out_of_service first
    .order('name');

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Equipment</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Run inspections and view equipment status. Items needing attention appear first.
        </p>
      </div>

      {(!equipment || equipment.length === 0) && (
        <Card>
          <CardContent className="py-12 text-center text-gray-400">
            No equipment found.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3">
        {(equipment ?? []).map((eq) => {
          const status = statusConfig[eq.overall_status as keyof typeof statusConfig] ?? statusConfig.ready;
          const Icon = status.icon;
          return (
            <Card key={eq.id} className="hover:border-orange-200 transition-colors">
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`h-5 w-5 shrink-0 ${status.iconClass}`} />
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{eq.name}</p>
                      <p className="text-xs text-gray-500">{eq.identifier} · {eq.type} · {eq.site}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3 shrink-0">
                    <Badge className={`text-xs hidden sm:inline-flex ${status.className}`}>
                      {status.label}
                    </Badge>
                    <Link href={`/eq/${eq.qr_code}/inspect`}>
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                        <ClipboardCheck className="h-3.5 w-3.5" />
                        Inspect
                      </Button>
                    </Link>
                    <Link href={`/eq/${eq.qr_code}`} target="_blank">
                      <ExternalLink className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
