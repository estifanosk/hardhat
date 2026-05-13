import Link from 'next/link';
import { dashboardStats, employees, equipment, jhaForms } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
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

export default function DashboardPage() {
  // Get expiring items
  const expiringCerts = employees.flatMap((emp) =>
    emp.certifications
      .filter((c) => c.status === 'expiring_soon' || c.status === 'expired')
      .map((c) => ({
        type: 'employee' as const,
        name: emp.name,
        item: c.name,
        status: c.status,
        expiryDate: c.expiryDate,
      }))
  );

  const expiringDocs = equipment.flatMap((eq) =>
    eq.documents
      .filter((d) => d.status === 'expiring_soon' || d.status === 'expired')
      .map((d) => ({
        type: 'equipment' as const,
        name: eq.identifier,
        item: d.name,
        status: d.status,
        expiryDate: d.expiryDate,
      }))
  );

  const allExpiring = [...expiringCerts, ...expiringDocs].sort((a, b) => {
    if (a.status === 'expired' && b.status !== 'expired') return -1;
    if (b.status === 'expired' && a.status !== 'expired') return 1;
    return 0;
  });

  // Get today's inspections
  const todayInspections = equipment.map((eq) => ({
    equipment: eq,
    status: eq.lastInspection
      ? eq.lastInspection.date === new Date().toISOString().split('T')[0]
        ? eq.lastInspection.status
        : 'pending'
      : 'pending',
    inspection: eq.lastInspection,
  }));

  const getDaysUntilExpiry = (dateStr: string | null) => {
    if (!dateStr) return null;
    const expiry = new Date(dateStr);
    const today = new Date();
    return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-orange-500 p-2 rounded-lg">
                <HardHat className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">HardHat</h1>
                <p className="text-xs text-gray-500">ABC Construction</p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              POC Demo
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Employees</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {dashboardStats.totalEmployees}
                  </p>
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
                  <p className="text-3xl font-bold text-gray-900">
                    {dashboardStats.totalEquipment}
                  </p>
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
                  <p className="text-3xl font-bold text-yellow-600">
                    {dashboardStats.expiringItems}
                  </p>
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
                  <p className="text-3xl font-bold text-red-600">
                    {dashboardStats.expiredItems}
                  </p>
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
              <div className="space-y-2">
                {allExpiring.slice(0, 5).map((item, idx) => {
                  const days = getDaysUntilExpiry(item.expiryDate);
                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        item.status === 'expired' ? 'bg-red-50' : 'bg-yellow-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {item.status === 'expired' ? (
                          <XCircle className="h-5 w-5 text-red-500" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-500">{item.item}</p>
                        </div>
                      </div>
                      <Badge
                        variant={item.status === 'expired' ? 'destructive' : 'outline'}
                        className={
                          item.status === 'expired'
                            ? ''
                            : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                        }
                      >
                        {item.status === 'expired'
                          ? `Expired ${Math.abs(days || 0)}d ago`
                          : `${days}d left`}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Today's Inspections */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5" />
                Today&apos;s Inspections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {todayInspections.map((item) => (
                  <Link
                    key={item.equipment.id}
                    href={`/eq/${item.equipment.qrCode}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {item.status === 'passed' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : item.status === 'failed' ? (
                        <XCircle className="h-5 w-5 text-red-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-gray-400" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.equipment.identifier}
                        </p>
                        <p className="text-sm text-gray-500">{item.equipment.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.status === 'passed' && item.inspection && (
                        <span className="text-sm text-gray-500">
                          {item.inspection.time}
                        </span>
                      )}
                      <Badge
                        variant={
                          item.status === 'passed'
                            ? 'default'
                            : item.status === 'failed'
                              ? 'destructive'
                              : 'outline'
                        }
                        className={
                          item.status === 'passed'
                            ? 'bg-green-100 text-green-700'
                            : item.status === 'pending'
                              ? 'bg-gray-100 text-gray-600'
                              : ''
                        }
                      >
                        {item.status === 'pending' ? 'Not inspected' : item.status}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Demo Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
              <Link href="/e/emp-abc123">
                <Button variant="outline" className="w-full justify-between h-auto py-3">
                  <div className="flex items-center gap-2">
                    <QrCode className="h-4 w-4" />
                    <span>Employee Scan</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link href="/eq/eq-xyz001">
                <Button variant="outline" className="w-full justify-between h-auto py-3">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    <span>Equipment Scan</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link href="/eq/eq-xyz001/inspect">
                <Button variant="outline" className="w-full justify-between h-auto py-3">
                  <div className="flex items-center gap-2">
                    <ClipboardCheck className="h-4 w-4" />
                    <span>Daily Checklist</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link href="/jha/jha-001">
                <Button variant="outline" className="w-full justify-between h-auto py-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>JHA Sign-off</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <Separator className="my-4" />

            <div className="text-sm text-gray-500">
              <p className="font-medium mb-2">Sample QR Codes (for testing):</p>
              <div className="grid sm:grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <span className="text-gray-400">Compliant Employee:</span>{' '}
                  <code className="bg-gray-100 px-1 rounded">/e/emp-def456</code>
                </div>
                <div>
                  <span className="text-gray-400">Expiring Employee:</span>{' '}
                  <code className="bg-gray-100 px-1 rounded">/e/emp-abc123</code>
                </div>
                <div>
                  <span className="text-gray-400">Non-Compliant:</span>{' '}
                  <code className="bg-gray-100 px-1 rounded">/e/emp-ghi789</code>
                </div>
                <div>
                  <span className="text-gray-400">Out of Service Equip:</span>{' '}
                  <code className="bg-gray-100 px-1 rounded">/eq/eq-xyz003</code>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 pt-4 pb-8">
          <p>HardHat POC - Scan. Verify. Work Safe.</p>
          <p className="mt-1">This is a demo with mock data</p>
        </div>
      </main>
    </div>
  );
}
