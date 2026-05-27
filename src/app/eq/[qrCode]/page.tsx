import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  ClipboardCheck,
  MapPin,
  Wrench,
  History,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ qrCode: string }>;
}

export default async function EquipmentScanPage({ params }: PageProps) {
  const { qrCode } = await params;
  const supabase = await createClient();

  const { data: equip } = await supabase
    .from('equipment')
    .select(`
      *,
      equipment_documents(*),
      inspections(id, inspector_name, inspection_date, inspection_time, status, notes)
    `)
    .eq('qr_code', qrCode)
    .order('inspection_date', { referencedTable: 'inspections', ascending: false })
    .single();

  if (!equip) notFound();

  const lastInspection = equip.inspections?.[0] ?? null;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'ready':
        return {
          label: 'READY',
          icon: CheckCircle2,
          color: 'bg-green-500',
          textColor: 'text-green-700',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
        };
      case 'needs_inspection':
        return {
          label: 'NEEDS INSPECTION',
          icon: AlertTriangle,
          color: 'bg-yellow-500',
          textColor: 'text-yellow-700',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
        };
      case 'out_of_service':
        return {
          label: 'OUT OF SERVICE',
          icon: XCircle,
          color: 'bg-red-500',
          textColor: 'text-red-700',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
        };
      default:
        return {
          label: 'UNKNOWN',
          icon: AlertTriangle,
          color: 'bg-gray-500',
          textColor: 'text-gray-700',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
        };
    }
  };

  const getDocStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return { icon: CheckCircle2, color: 'text-green-600' };
      case 'expiring_soon':
        return { icon: AlertTriangle, color: 'text-yellow-600' };
      case 'expired':
        return { icon: XCircle, color: 'text-red-600' };
      default:
        return { icon: AlertTriangle, color: 'text-gray-600' };
    }
  };

  const getInspectionStatusConfig = (status: string) => {
    switch (status) {
      case 'passed':
        return { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' };
      case 'failed':
        return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' };
      case 'needs_attention':
        return { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50' };
      default:
        return { icon: AlertTriangle, color: 'text-gray-600', bg: 'bg-gray-50' };
    }
  };

  const statusConfig = getStatusConfig(equip.overall_status);
  const StatusIcon = statusConfig.icon;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'No expiry';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header Card */}
        <Card>
          <CardContent className="pt-6">
            {/* Equipment Image */}
            <div className="w-full h-40 rounded-lg overflow-hidden mb-4 bg-gray-200">
              {equip.photo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={equip.photo_url}
                  alt={equip.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <div className="space-y-1">
              <h1 className="text-xl font-bold text-gray-900">{equip.name}</h1>
              <div className="flex items-center gap-2 text-gray-600">
                <Badge variant="outline">{equip.identifier}</Badge>
                <span className="text-sm">{equip.type}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <MapPin className="h-4 w-4" />
                {equip.site}
              </div>
            </div>

            {/* Status Banner */}
            <div
              className={`mt-4 p-3 rounded-lg flex items-center justify-center gap-2 ${statusConfig.bgColor} ${statusConfig.borderColor} border`}
            >
              <StatusIcon className={`h-6 w-6 ${statusConfig.textColor}`} />
              <span className={`font-bold text-lg ${statusConfig.textColor}`}>
                {statusConfig.label}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents
            </h2>
            <div className="space-y-3">
              {(equip.equipment_documents ?? []).map((doc: { id: string; name: string; status: string; expiry_date: string | null }) => {
                const docStatus = getDocStatusConfig(doc.status);
                const DocIcon = docStatus.icon;

                return (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50"
                  >
                    <DocIcon className={`h-5 w-5 ${docStatus.color}`} />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">{doc.name}</span>
                      <p className="text-sm text-gray-500">
                        Expires: {formatDate(doc.expiry_date)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Last Inspection */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              Last Inspection
            </h2>

            {lastInspection ? (
              <div
                className={`p-4 rounded-lg ${getInspectionStatusConfig(lastInspection.status).bg}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {(() => {
                    const config = getInspectionStatusConfig(lastInspection.status);
                    const InspIcon = config.icon;
                    return <InspIcon className={`h-5 w-5 ${config.color}`} />;
                  })()}
                  <span className="font-semibold capitalize">
                    {lastInspection.status.replace('_', ' ')}
                  </span>
                  <span className="text-gray-500">-</span>
                  <span className="text-gray-600">
                    {lastInspection.inspection_date === new Date().toISOString().split('T')[0]
                      ? 'Today'
                      : lastInspection.inspection_date}{' '}
                    {lastInspection.inspection_time ?? ''}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  By: {lastInspection.inspector_name}
                </p>
                {lastInspection.notes && (
                  <p className="text-sm text-gray-700 mt-2 p-2 bg-white/50 rounded">
                    <Wrench className="h-4 w-4 inline mr-1" />
                    {lastInspection.notes}
                  </p>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <span className="text-yellow-700 font-medium">
                    No inspection recorded today
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link href={`/eq/${qrCode}/inspect`} className="block">
            <Button className="w-full h-14 text-lg" size="lg">
              <ClipboardCheck className="h-5 w-5 mr-2" />
              Start Daily Checklist
            </Button>
          </Link>

          <Button variant="outline" className="w-full" disabled>
            <History className="h-4 w-4 mr-2" />
            View Inspection History
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 pt-2">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <p className="mt-1">
            Powered by HardHat ·{' '}
            <a href="/help" className="underline hover:text-gray-600">Help</a>
          </p>
        </div>
      </div>
    </div>
  );
}
