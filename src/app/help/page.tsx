import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { HardHat, CheckCircle2, AlertTriangle, XCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="bg-orange-500 p-1.5 rounded-lg">
              <HardHat className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">HardHat Help</h1>
          </div>
        </div>

        <Tabs defaultValue="admin">
          <TabsList className="w-full">
            <TabsTrigger value="admin" className="flex-1">Admin Guide</TabsTrigger>
            <TabsTrigger value="field" className="flex-1">Field Worker Guide</TabsTrigger>
            <TabsTrigger value="status" className="flex-1">Status Indicators</TabsTrigger>
          </TabsList>

          {/* Admin Guide */}
          <TabsContent value="admin" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Getting Started</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-2">
                <p>As an admin, you can manage employees, their certifications, and equipment across all job sites. Sign in at <span className="font-mono bg-gray-100 px-1 rounded">/login</span> with your credentials.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Managing Employees</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-3">
                <div>
                  <p className="font-medium text-gray-800 mb-1">1. Create an employee</p>
                  <p>Go to <span className="font-mono bg-gray-100 px-1 rounded">Admin → Employees → Add Employee</span>. Enter their full name, job title, and company. A unique QR code is automatically generated.</p>
                </div>
                <div>
                  <p className="font-medium text-gray-800 mb-1">2. Add certifications</p>
                  <p>Open the employee's detail page and use the <strong>Add certification</strong> form. Choose the type:</p>
                  <ul className="mt-1 ml-4 space-y-1 list-disc">
                    <li><strong>Certification</strong> — e.g. OSHA 30-Hour, First Aid</li>
                    <li><strong>License</strong> — e.g. Crane Operator License, Driver's License</li>
                    <li><strong>Task Training</strong> — e.g. Confined Space Entry, Fall Arrest</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-gray-800 mb-1">3. Set expiry dates</p>
                  <p>Always enter an expiry date for time-limited certifications. The system automatically flags items expiring within 30 days. Task training with no expiry can be left blank.</p>
                </div>
                <div>
                  <p className="font-medium text-gray-800 mb-1">4. Download and print QR codes</p>
                  <p>From the employee detail page, click <strong>Download QR image</strong> to get a PNG file. Print and attach to the worker's hard hat or ID badge.</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Managing Equipment</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-3">
                <div>
                  <p className="font-medium text-gray-800 mb-1">1. Create equipment</p>
                  <p>Go to <span className="font-mono bg-gray-100 px-1 rounded">Admin → Equipment → Add Equipment</span>. Enter the name, type, unit ID (your internal number), and job site.</p>
                </div>
                <div>
                  <p className="font-medium text-gray-800 mb-1">2. Add documents</p>
                  <p>Open the equipment detail page and add documents such as registration, insurance, or inspection certificates with their expiry dates.</p>
                </div>
                <div>
                  <p className="font-medium text-gray-800 mb-1">3. Attach QR code to equipment</p>
                  <p>Download and attach the QR code sticker to the equipment in a visible location (e.g. dashboard, control panel).</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Expiration Alerts</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-2">
                <p>The system sends daily email alerts to all admins listing any certifications or equipment documents expiring within 30 days or already expired.</p>
                <p>Make sure your admin profile has a valid email address to receive these alerts.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Field Worker Guide */}
          <TabsContent value="field" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Scanning Employee QR Codes</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-3">
                <div>
                  <p className="font-medium text-gray-800 mb-1">How to scan</p>
                  <p>Open your phone's camera app and point it at the QR code on a worker's hard hat or ID badge. Tap the link that appears — no app install required.</p>
                </div>
                <div>
                  <p className="font-medium text-gray-800 mb-1">What you'll see</p>
                  <ul className="ml-4 space-y-1 list-disc">
                    <li>Worker's name, role, and company</li>
                    <li>Overall compliance status (green / yellow / red)</li>
                    <li>List of certifications and licenses with expiry dates</li>
                    <li>Task training completed</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-gray-800 mb-1">No login needed</p>
                  <p>The scan page is public — anyone with the link can view the compliance status. No account is required.</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Scanning Equipment QR Codes</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-3">
                <div>
                  <p className="font-medium text-gray-800 mb-1">How to scan</p>
                  <p>Scan the QR code sticker on the equipment (dashboard, control panel, or body). The scan page shows the equipment's current status and document validity.</p>
                </div>
                <div>
                  <p className="font-medium text-gray-800 mb-1">Running a daily inspection</p>
                  <p>From the equipment scan page, tap <strong>Run Inspection</strong>. Complete the checklist, add any notes, and submit. The inspection is logged and the equipment status is updated.</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">When Something is Red</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-2">
                <p>A red status means a certification has expired or an equipment document is out of date. <strong>Do not allow the worker on site or operate the equipment</strong> until the issue is resolved by an admin.</p>
                <p>Contact your site admin or supervisor immediately.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Status Indicators */}
          <TabsContent value="status" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Employee Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-sm text-gray-900">Compliant</p>
                    <p className="text-sm text-gray-500">All certifications and licenses are valid and not expiring soon.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-sm text-gray-900">Expiring Soon</p>
                    <p className="text-sm text-gray-500">One or more certifications expire within 30 days. Worker can still be on site but action is required.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-sm text-gray-900">Non-Compliant</p>
                    <p className="text-sm text-gray-500">One or more certifications have expired. Worker should not be on site until resolved.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Equipment Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-sm text-gray-900">Ready</p>
                    <p className="text-sm text-gray-500">All documents are valid. Equipment is cleared for operation.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-sm text-gray-900">Needs Inspection</p>
                    <p className="text-sm text-gray-500">One or more documents expire within 30 days. Equipment can still be operated but admin must act soon.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-sm text-gray-900">Out of Service</p>
                    <p className="text-sm text-gray-500">One or more documents have expired. Equipment must not be operated until resolved.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Certification Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Badge className="bg-green-100 text-green-700">active</Badge>
                  <p className="text-sm text-gray-500">Valid and not expiring within 30 days.</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-yellow-100 text-yellow-700">expiring soon</Badge>
                  <p className="text-sm text-gray-500">Expires within the next 30 days.</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-red-100 text-red-700">expired</Badge>
                  <p className="text-sm text-gray-500">Past the expiry date — renewal required.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
