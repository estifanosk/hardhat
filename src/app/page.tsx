import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  HardHat, QrCode, Shield, ClipboardCheck, Bell, ArrowRight,
  CheckCircle2, AlertTriangle, XCircle, Smartphone, Users, Truck, BookOpen,
} from 'lucide-react';

function QrIllustration() {
  return (
    <svg viewBox="0 0 80 80" className="w-14 h-14" fill="none">
      <rect x="2" y="2" width="24" height="24" rx="2" fill="black"/>
      <rect x="5" y="5" width="18" height="18" rx="1" fill="white"/>
      <rect x="9" y="9" width="10" height="10" fill="black"/>
      <rect x="54" y="2" width="24" height="24" rx="2" fill="black"/>
      <rect x="57" y="5" width="18" height="18" rx="1" fill="white"/>
      <rect x="61" y="9" width="10" height="10" fill="black"/>
      <rect x="2" y="54" width="24" height="24" rx="2" fill="black"/>
      <rect x="5" y="57" width="18" height="18" rx="1" fill="white"/>
      <rect x="9" y="61" width="10" height="10" fill="black"/>
      <rect x="30" y="2" width="6" height="6" fill="black"/>
      <rect x="40" y="2" width="6" height="6" fill="black"/>
      <rect x="30" y="12" width="6" height="6" fill="black"/>
      <rect x="30" y="30" width="6" height="6" fill="black"/>
      <rect x="40" y="30" width="6" height="6" fill="black"/>
      <rect x="50" y="30" width="6" height="6" fill="black"/>
      <rect x="30" y="40" width="6" height="6" fill="black"/>
      <rect x="54" y="30" width="6" height="6" fill="black"/>
      <rect x="54" y="40" width="6" height="6" fill="black"/>
      <rect x="40" y="54" width="6" height="6" fill="black"/>
      <rect x="54" y="54" width="6" height="6" fill="black"/>
      <rect x="68" y="54" width="6" height="6" fill="black"/>
      <rect x="54" y="68" width="6" height="6" fill="black"/>
      <rect x="68" y="40" width="6" height="6" fill="black"/>
    </svg>
  );
}

function PhoneMockup() {
  return (
    <div className="relative mx-auto w-40 bg-gray-900 rounded-3xl p-1.5 shadow-2xl">
      <div className="w-full bg-white rounded-2xl overflow-hidden">
        <div className="bg-gray-900 h-4 flex items-center justify-center">
          <div className="w-8 h-1.5 bg-gray-700 rounded-full" />
        </div>
        <div className="bg-green-500 text-white text-center py-1.5 text-xs font-bold tracking-wide">
          ✓ COMPLIANT
        </div>
        <div className="p-2.5 space-y-2 bg-gray-50">
          <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm">
            <div className="w-7 h-7 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
              <HardHat className="h-3.5 w-3.5 text-orange-500" />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-900">John Smith</div>
              <div className="text-xs text-gray-400">Crane Operator</div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center bg-green-50 rounded px-2 py-1">
              <span className="text-xs text-gray-700">OSHA 30-Hour</span>
              <span className="text-xs text-green-600 font-medium">Active</span>
            </div>
            <div className="flex justify-between items-center bg-green-50 rounded px-2 py-1">
              <span className="text-xs text-gray-700">Crane License</span>
              <span className="text-xs text-green-600 font-medium">Active</span>
            </div>
            <div className="flex justify-between items-center bg-yellow-50 rounded px-2 py-1">
              <span className="text-xs text-gray-700">First Aid</span>
              <span className="text-xs text-yellow-600 font-medium">28d left</span>
            </div>
          </div>
        </div>
        <div className="bg-white h-4 flex items-center justify-center">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>
      </div>
    </div>
  );
}

function EquipmentPhoneMockup() {
  return (
    <div className="relative mx-auto w-40 bg-gray-900 rounded-3xl p-1.5 shadow-2xl">
      <div className="w-full bg-white rounded-2xl overflow-hidden">
        <div className="bg-gray-900 h-4 flex items-center justify-center">
          <div className="w-8 h-1.5 bg-gray-700 rounded-full" />
        </div>
        <div className="bg-blue-500 text-white text-center py-1.5 text-xs font-bold tracking-wide">
          EQUIPMENT STATUS
        </div>
        <div className="p-2.5 space-y-2 bg-gray-50">
          <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm">
            <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
              <Truck className="h-3.5 w-3.5 text-blue-500" />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-900">Excavator #04</div>
              <div className="text-xs text-gray-400">Unit ID: EXC-004</div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center bg-green-50 rounded px-2 py-1">
              <span className="text-xs text-gray-700">Registration</span>
              <span className="text-xs text-green-600 font-medium">Valid</span>
            </div>
            <div className="flex justify-between items-center bg-green-50 rounded px-2 py-1">
              <span className="text-xs text-gray-700">Insurance</span>
              <span className="text-xs text-green-600 font-medium">Valid</span>
            </div>
            <div className="flex justify-between items-center bg-red-50 rounded px-2 py-1">
              <span className="text-xs text-gray-700">Inspection</span>
              <span className="text-xs text-red-600 font-medium">Expired</span>
            </div>
          </div>
        </div>
        <div className="bg-white h-4 flex items-center justify-center">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Hero */}
      <div className="max-w-4xl mx-auto px-4 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-full mb-6">
          <HardHat className="h-6 w-6" />
          <span className="font-bold text-lg">HardHat</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Scan. Verify. Work Safe.
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          QR-based compliance verification for construction crews. Instantly verify
          worker certifications and equipment readiness on any job site.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login">
            <Button size="lg" className="w-full sm:w-auto text-lg px-8 h-14">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="#guide">
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 h-14">
              <BookOpen className="mr-2 h-5 w-5" />
              View Guide
            </Button>
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-2 hover:border-orange-200 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <QrCode className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">Employee QR Scan</h3>
                  <p className="text-gray-600 mt-1">
                    Scan a worker&apos;s hard hat QR code to instantly see their
                    certifications, licenses, and task training status.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 hover:border-orange-200 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">Equipment Verification</h3>
                  <p className="text-gray-600 mt-1">
                    Scan equipment QR codes to check registration, insurance, and
                    inspection status before operation.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 hover:border-orange-200 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <ClipboardCheck className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">Daily Inspections</h3>
                  <p className="text-gray-600 mt-1">
                    Mobile-friendly pre-use checklists with photo capture. Flag issues
                    and notify maintenance in real-time.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 hover:border-orange-200 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <Bell className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">JHA Sign-off</h3>
                  <p className="text-gray-600 mt-1">
                    Digital Job Hazard Analysis forms with crew acknowledgment. Track
                    safety meetings and hazard awareness.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Visual Guide */}
      <div id="guide" className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">How It Works</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              No app install needed. Just a phone camera and the QR code.
            </p>
          </div>

          {/* Scanning flow */}
          <div className="grid md:grid-cols-3 gap-8 items-center mb-16">
            {/* Step 1 */}
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto">
                1
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border flex flex-col items-center gap-4">
                <div className="bg-orange-50 rounded-xl p-4">
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative">
                      <div className="bg-orange-200 rounded-full p-3">
                        <HardHat className="h-8 w-8 text-orange-600" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-white rounded p-0.5 shadow">
                        <QrIllustration />
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">QR on the Hard Hat</p>
                  <p className="text-sm text-gray-500 mt-1">Each worker and piece of equipment gets a unique QR sticker</p>
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center justify-center">
              <ArrowRight className="h-8 w-8 text-gray-300" />
            </div>

            {/* Step 2 */}
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto">
                2
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border flex flex-col items-center gap-4">
                <div className="bg-blue-50 rounded-xl p-4 flex items-center gap-3">
                  <Smartphone className="h-8 w-8 text-blue-500" />
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-800">Open camera app</div>
                    <div className="text-xs text-gray-400">Point at QR code</div>
                    <div className="text-xs text-gray-400">Tap the link</div>
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Scan with Any Phone</p>
                  <p className="text-sm text-gray-500 mt-1">No app download required — the built-in camera handles it</p>
                </div>
              </div>
            </div>
          </div>

          {/* What you see */}
          <div className="mb-16">
            <h3 className="text-xl font-bold text-gray-900 text-center mb-8">What You See After Scanning</h3>
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="space-y-4">
                <PhoneMockup />
                <p className="text-center text-sm text-gray-500">Employee compliance profile</p>
              </div>
              <div className="space-y-4">
                <EquipmentPhoneMockup />
                <p className="text-center text-sm text-gray-500">Equipment document status</p>
              </div>
            </div>
          </div>

          {/* Status indicators */}
          <div className="mb-16">
            <h3 className="text-xl font-bold text-gray-900 text-center mb-8">Understanding Status Colors</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 border-2 border-green-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-green-100 p-2 rounded-full">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="font-bold text-green-700 text-lg">Green</span>
                </div>
                <div className="space-y-2">
                  <div className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">
                    Compliant / Ready
                  </div>
                  <p className="text-sm text-gray-600">
                    All certifications and documents are valid. Worker is cleared for site. Equipment is safe to operate.
                  </p>
                  <div className="bg-green-50 rounded-lg p-3 text-xs text-green-800 font-medium">
                    ✓ Good to go
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border-2 border-yellow-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-yellow-100 p-2 rounded-full">
                    <AlertTriangle className="h-6 w-6 text-yellow-600" />
                  </div>
                  <span className="font-bold text-yellow-700 text-lg">Yellow</span>
                </div>
                <div className="space-y-2">
                  <div className="inline-block bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-1 rounded">
                    Expiring Soon
                  </div>
                  <p className="text-sm text-gray-600">
                    One or more items expire within 30 days. Worker can still be on site but admin must renew soon.
                  </p>
                  <div className="bg-yellow-50 rounded-lg p-3 text-xs text-yellow-800 font-medium">
                    ⚠ Action required soon
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border-2 border-red-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-red-100 p-2 rounded-full">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <span className="font-bold text-red-700 text-lg">Red</span>
                </div>
                <div className="space-y-2">
                  <div className="inline-block bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded">
                    Expired / Non-Compliant
                  </div>
                  <p className="text-sm text-gray-600">
                    One or more items have expired. Worker must not be on site. Equipment must not be operated.
                  </p>
                  <div className="bg-red-50 rounded-lg p-3 text-xs text-red-800 font-medium">
                    ✕ Contact your admin immediately
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Role guide */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-8">Quick Guide by Role</h3>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Admin */}
              <div className="bg-white rounded-2xl border p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <Users className="h-5 w-5 text-orange-600" />
                  </div>
                  <h4 className="font-bold text-gray-900 text-lg">Admins</h4>
                </div>
                <ol className="space-y-4">
                  <li className="flex gap-3">
                    <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Invite team members</p>
                      <p className="text-xs text-gray-500 mt-0.5">Go to Admin → Users → Send invite with their email and role</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Add employees & certifications</p>
                      <p className="text-xs text-gray-500 mt-0.5">Create an employee profile and add their OSHA cards, licenses, and training</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Add equipment & documents</p>
                      <p className="text-xs text-gray-500 mt-0.5">Register each machine and upload registration, insurance, and inspection docs</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">4</span>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Print & attach QR stickers</p>
                      <p className="text-xs text-gray-500 mt-0.5">Download QR code PNGs and stick them on hard hats and equipment</p>
                    </div>
                  </li>
                </ol>
              </div>

              {/* Field Workers */}
              <div className="bg-white rounded-2xl border p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <HardHat className="h-5 w-5 text-blue-600" />
                  </div>
                  <h4 className="font-bold text-gray-900 text-lg">Field Workers & Foremen</h4>
                </div>
                <ol className="space-y-4">
                  <li className="flex gap-3">
                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Open your camera</p>
                      <p className="text-xs text-gray-500 mt-0.5">Use the native camera on any smartphone — no app needed</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Scan the QR code</p>
                      <p className="text-xs text-gray-500 mt-0.5">Point at the sticker on a hard hat or piece of equipment and tap the link</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Check the status color</p>
                      <p className="text-xs text-gray-500 mt-0.5">Green = clear. Yellow = expiring soon. Red = do not allow on site</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">4</span>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Run a daily inspection</p>
                      <p className="text-xs text-gray-500 mt-0.5">From the equipment scan page, tap Run Inspection and complete the checklist</p>
                    </div>
                  </li>
                </ol>
              </div>
            </div>
          </div>

          <div className="text-center mt-10">
            <Link href="/help">
              <Button variant="outline" size="lg" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Read the Full Help Guide
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Ready to see it in action?
        </h2>
        <p className="text-gray-600 mb-6">
          Manage your crew certifications, equipment, and job site compliance in one place.
        </p>
        <Link href="/login">
          <Button size="lg" className="text-lg px-8 h-14">
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>HardHat — Construction Compliance Made Simple</p>
          <p className="mt-1">Built for construction teams that take safety seriously</p>
        </div>
      </footer>
    </div>
  );
}
