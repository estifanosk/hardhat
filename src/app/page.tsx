import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  HardHat,
  QrCode,
  Shield,
  ClipboardCheck,
  Bell,
  ArrowRight,
} from 'lucide-react';

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
          <Link href="/dashboard">
            <Button size="lg" className="w-full sm:w-auto text-lg px-8 h-14">
              Go to Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 h-14">
              Admin Login
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
                  <h3 className="font-semibold text-lg text-gray-900">
                    Employee QR Scan
                  </h3>
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
                  <h3 className="font-semibold text-lg text-gray-900">
                    Equipment Verification
                  </h3>
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
                  <h3 className="font-semibold text-lg text-gray-900">
                    Daily Inspections
                  </h3>
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
                  <h3 className="font-semibold text-lg text-gray-900">
                    JHA Sign-off
                  </h3>
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

      {/* How it works */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Generate QR Codes</h3>
              <p className="text-gray-600 text-sm">
                Admin creates employee and equipment profiles, system generates unique
                QR codes for hard hat stickers.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Scan in Field</h3>
              <p className="text-gray-600 text-sm">
                Foremen and inspectors scan QR codes with any smartphone camera. No
                app install required.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Instant Verification</h3>
              <p className="text-gray-600 text-sm">
                See compliance status immediately. Green = good to go. Yellow = expiring
                soon. Red = action required.
              </p>
            </div>
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
          <p>HardHat - Construction Compliance Made Simple</p>
          <p className="mt-1">Built for construction teams that take safety seriously</p>
        </div>
      </footer>
    </div>
  );
}
