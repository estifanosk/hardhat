import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import {
  updateEquipment,
  deleteEquipment,
  addDocument,
  deleteDocument,
  setEquipmentStatus,
} from '../actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  ArrowLeft,
  QrCode,
  Trash2,
  Plus,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  FileText,
} from 'lucide-react';

const EQUIPMENT_TYPES = ['Excavator', 'Crane', 'Forklift', 'Loader', 'Bulldozer', 'Compactor', 'Generator', 'Scissor Lift', 'Boom Lift', 'Other'];

const statusBadge = {
  active: 'bg-green-100 text-green-700',
  expiring_soon: 'bg-yellow-100 text-yellow-700',
  expired: 'bg-red-100 text-red-700',
};

const statusIcon = { active: CheckCircle2, expiring_soon: AlertTriangle, expired: XCircle };

const overallStatusOptions = [
  { value: 'ready', label: 'Ready', className: 'bg-green-100 text-green-700' },
  { value: 'needs_inspection', label: 'Needs Inspection', className: 'bg-yellow-100 text-yellow-700' },
  { value: 'out_of_service', label: 'Out of Service', className: 'bg-red-100 text-red-700' },
];

export default async function EquipmentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error: paramError } = await searchParams;
  const supabase = await createClient();

  const { data: eq } = await supabase
    .from('equipment')
    .select('*, equipment_documents(*), inspections(id, inspector_name, inspection_date, inspection_time, status, notes)')
    .eq('id', id)
    .order('inspection_date', { referencedTable: 'inspections', ascending: false })
    .single();

  if (!eq) notFound();

  const updateWithId = updateEquipment.bind(null, id);
  const deleteWithId = deleteEquipment.bind(null, id);
  const addDocWithId = addDocument.bind(null, id);
  const lastInspection = eq.inspections?.[0] ?? null;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/equipment">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Equipment
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-gray-900">{eq.name}</h1>
        <Badge className={overallStatusOptions.find((o) => o.value === eq.overall_status)?.className ?? ''}>
          {overallStatusOptions.find((o) => o.value === eq.overall_status)?.label}
        </Badge>
      </div>

      {paramError && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{paramError}</p>
      )}

      {/* Equipment info */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Equipment details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateWithId} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" defaultValue={eq.name} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="type">Type</Label>
                <select
                  id="type"
                  name="type"
                  defaultValue={eq.type}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {EQUIPMENT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="identifier">Unit ID</Label>
                <Input id="identifier" name="identifier" defaultValue={eq.identifier} required />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="site">Job site</Label>
                <Input id="site" name="site" defaultValue={eq.site} required />
              </div>
            </div>
            <Button type="submit">Save changes</Button>
          </form>
        </CardContent>
      </Card>

      {/* Manual status override */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Status override</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-3">
            Status is auto-computed from documents. Override manually if needed (e.g. mechanical failure).
          </p>
          <div className="flex gap-2">
            {overallStatusOptions.map((opt) => {
              const setStatus = setEquipmentStatus.bind(null, id, opt.value);
              return (
                <form key={opt.value} action={setStatus}>
                  <Button
                    type="submit"
                    variant={eq.overall_status === opt.value ? 'default' : 'outline'}
                    size="sm"
                  >
                    {opt.label}
                  </Button>
                </form>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* QR Code */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            QR Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="bg-gray-50 border rounded-lg p-3">
              <p className="font-mono text-sm text-gray-600">{eq.qr_code}</p>
            </div>
            <div className="flex flex-col gap-3">
              <Link href={`/eq/${eq.qr_code}`} target="_blank">
                <Button variant="outline" size="sm" className="gap-1.5 w-full">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Preview scan page
                </Button>
              </Link>
              <Link href={`/api/qr/${eq.qr_code}`} target="_blank">
                <Button variant="outline" size="sm" className="gap-1.5 w-full">
                  <QrCode className="h-3.5 w-3.5" />
                  Download QR image
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documents
            <span className="text-sm font-normal text-gray-400">
              ({eq.equipment_documents?.length ?? 0})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {eq.equipment_documents?.length > 0 && (
            <ul className="divide-y border rounded-lg overflow-hidden">
              {eq.equipment_documents.map(
                (doc: { id: string; name: string; expiry_date: string | null; status: string }) => {
                  const Icon = statusIcon[doc.status as keyof typeof statusIcon] ?? CheckCircle2;
                  const deleteDocWithIds = deleteDocument.bind(null, doc.id, id);
                  return (
                    <li key={doc.id} className="flex items-center justify-between px-3 py-2.5 bg-white">
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`h-4 w-4 ${
                            doc.status === 'active' ? 'text-green-500' : doc.status === 'expiring_soon' ? 'text-yellow-500' : 'text-red-500'
                          }`}
                        />
                        <div>
                          <p className="font-medium text-sm text-gray-900">{doc.name}</p>
                          <p className="text-xs text-gray-500">
                            {doc.expiry_date
                              ? `Expires ${new Date(doc.expiry_date).toLocaleDateString()}`
                              : 'No expiry'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${statusBadge[doc.status as keyof typeof statusBadge]}`}>
                          {doc.status.replace('_', ' ')}
                        </Badge>
                        <form action={deleteDocWithIds}>
                          <button type="submit" className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Delete document">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </form>
                      </div>
                    </li>
                  );
                }
              )}
            </ul>
          )}

          <div className="border rounded-lg p-4 bg-gray-50">
            <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              Add document
            </p>
            <form action={addDocWithId} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 col-span-2">
                  <Label className="text-xs">Document name</Label>
                  <Input name="name" placeholder="Insurance Certificate" required className="h-8 text-sm" />
                </div>
                <div className="space-y-1 col-span-2">
                  <Label className="text-xs">Expiry date (leave blank if none)</Label>
                  <Input name="expiry_date" type="date" className="h-8 text-sm" />
                </div>
              </div>
              <Button type="submit" size="sm" className="gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                Add
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      {/* Last Inspection */}
      {lastInspection && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Last Inspection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              {lastInspection.status === 'passed' ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <div>
                <p className="font-medium text-gray-900 capitalize">{lastInspection.status.replace('_', ' ')}</p>
                <p className="text-sm text-gray-500">
                  {lastInspection.inspection_date} {lastInspection.inspection_time ?? ''} by {lastInspection.inspector_name}
                </p>
                {lastInspection.notes && (
                  <p className="text-sm text-gray-600 mt-1">{lastInspection.notes}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Danger zone */}
      <Card className="border-red-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-red-600">Danger zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Delete equipment</p>
              <p className="text-sm text-gray-500">Permanently removes this equipment and all records.</p>
            </div>
            <form action={deleteWithId}>
              <Button type="submit" variant="destructive" size="sm" className="gap-1.5">
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
