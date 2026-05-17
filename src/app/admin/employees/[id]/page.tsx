import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import {
  updateEmployee,
  deleteEmployee,
  addCertification,
  deleteCertification,
} from '../actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
} from 'lucide-react';

const certTypeLabels: Record<string, string> = {
  certification: 'Certification',
  license: 'License',
  task_training: 'Task Training',
};

const statusBadge = {
  active: 'bg-green-100 text-green-700',
  expiring_soon: 'bg-yellow-100 text-yellow-700',
  expired: 'bg-red-100 text-red-700',
};

const statusIcon = {
  active: CheckCircle2,
  expiring_soon: AlertTriangle,
  expired: XCircle,
};

export default async function EmployeeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error: paramError } = await searchParams;
  const supabase = await createClient();

  const { data: employee } = await supabase
    .from('employees')
    .select('*, certifications(*)')
    .eq('id', id)
    .single();

  if (!employee) notFound();

  const updateWithId = updateEmployee.bind(null, id);
  const deleteWithId = deleteEmployee.bind(null, id);
  const addCertWithId = addCertification.bind(null, id);

  const qrUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL ? '' : 'http://localhost:3000'}/e/${employee.qr_code}`;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/employees">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Employees
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-gray-900">{employee.name}</h1>
      </div>

      {paramError && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{paramError}</p>
      )}

      {/* Employee info */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Employee details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateWithId} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" name="name" defaultValue={employee.name} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="role">Job title / role</Label>
                <Input id="role" name="role" defaultValue={employee.role} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="company">Company</Label>
                <Input id="company" name="company" defaultValue={employee.company} required />
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <Button type="submit">Save changes</Button>
            </div>
          </form>
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
              <p className="font-mono text-sm text-gray-600">{employee.qr_code}</p>
            </div>
            <div className="flex flex-col gap-3">
              <Link href={`/e/${employee.qr_code}`} target="_blank">
                <Button variant="outline" size="sm" className="gap-1.5 w-full">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Preview scan page
                </Button>
              </Link>
              <Link href={`/api/qr/${employee.qr_code}`} target="_blank">
                <Button variant="outline" size="sm" className="gap-1.5 w-full">
                  <QrCode className="h-3.5 w-3.5" />
                  Download QR image
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certifications */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Certifications & Licenses
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({employee.certifications?.length ?? 0})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {employee.certifications?.length > 0 && (
            <ul className="divide-y border rounded-lg overflow-hidden">
              {employee.certifications.map(
                (cert: {
                  id: string;
                  name: string;
                  type: string;
                  issuing_body: string | null;
                  issue_date: string;
                  expiry_date: string | null;
                  status: string;
                }) => {
                  const Icon = statusIcon[cert.status as keyof typeof statusIcon] ?? CheckCircle2;
                  const deleteCertWithIds = deleteCertification.bind(null, cert.id, id);
                  return (
                    <li key={cert.id} className="flex items-center justify-between px-3 py-2.5 bg-white">
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`h-4 w-4 ${
                            cert.status === 'active'
                              ? 'text-green-500'
                              : cert.status === 'expiring_soon'
                                ? 'text-yellow-500'
                                : 'text-red-500'
                          }`}
                        />
                        <div>
                          <p className="font-medium text-sm text-gray-900">{cert.name}</p>
                          <p className="text-xs text-gray-500">
                            {certTypeLabels[cert.type]}
                            {cert.issuing_body ? ` · ${cert.issuing_body}` : ''}
                            {cert.expiry_date
                              ? ` · Expires ${new Date(cert.expiry_date).toLocaleDateString()}`
                              : ' · No expiry'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${statusBadge[cert.status as keyof typeof statusBadge]}`}>
                          {cert.status.replace('_', ' ')}
                        </Badge>
                        <form action={deleteCertWithIds}>
                          <button
                            type="submit"
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                            title="Delete certification"
                          >
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

          {/* Add certification form */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              Add certification
            </p>
            <form action={addCertWithId} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 col-span-2">
                  <Label className="text-xs">Name</Label>
                  <Input name="name" placeholder="OSHA 30-Hour" required className="h-8 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Type</Label>
                  <select
                    name="type"
                    required
                    className="h-8 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="certification">Certification</option>
                    <option value="license">License</option>
                    <option value="task_training">Task Training</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Issuing body</Label>
                  <Input name="issuing_body" placeholder="OSHA" className="h-8 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Issue date</Label>
                  <Input name="issue_date" type="date" required className="h-8 text-sm" />
                </div>
                <div className="space-y-1">
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

      {/* Danger zone */}
      <Card className="border-red-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-red-600">Danger zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Delete employee</p>
              <p className="text-sm text-gray-500">
                Permanently removes this employee and all their certifications.
              </p>
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
