'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { equipment, excavatorChecklist } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import {
  CheckCircle2,
  XCircle,
  Camera,
  ArrowLeft,
  Loader2,
  ClipboardCheck,
} from 'lucide-react';

type ChecklistStatus = 'pass' | 'fail' | null;

export default function InspectionPage() {
  const params = useParams();
  const router = useRouter();
  const qrCode = params.qrCode as string;

  const equip = equipment.find((e) => e.qrCode === qrCode);

  const [inspectorName, setInspectorName] = useState('');
  const [checklistItems, setChecklistItems] = useState<Record<string, ChecklistStatus>>(
    excavatorChecklist.reduce(
      (acc, item) => {
        acc[item.id] = null;
        return acc;
      },
      {} as Record<string, ChecklistStatus>
    )
  );
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!equip) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold">Equipment Not Found</h1>
            <p className="text-gray-500 mt-2">The scanned QR code is not valid.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleStatusChange = (itemId: string, status: ChecklistStatus) => {
    setChecklistItems((prev) => ({
      ...prev,
      [itemId]: prev[itemId] === status ? null : status,
    }));
  };

  const handlePhotoAdd = () => {
    // Simulate adding a photo
    const fakePhotoId = `photo-${Date.now()}`;
    setPhotos((prev) => [...prev, fakePhotoId]);
    toast.success('Photo added');
  };

  const handleSubmit = async () => {
    // Validation
    if (!inspectorName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    const unansweredRequired = excavatorChecklist.filter(
      (item) => item.required && checklistItems[item.id] === null
    );

    if (unansweredRequired.length > 0) {
      toast.error(`Please complete all required items (${unansweredRequired.length} remaining)`);
      return;
    }

    const hasFailures = Object.values(checklistItems).some((status) => status === 'fail');
    if (hasFailures && !notes.trim()) {
      toast.error('Please add notes describing the failed items');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);

    const allPassed = Object.values(checklistItems).every(
      (status) => status === 'pass' || status === null
    );

    if (allPassed) {
      toast.success('Inspection submitted successfully! Equipment cleared for use.');
    } else {
      toast.warning('Inspection submitted. Maintenance has been notified of issues.');
    }

    // Redirect back to equipment page
    setTimeout(() => {
      router.push(`/eq/${qrCode}`);
    }, 2000);
  };

  const completedCount = Object.values(checklistItems).filter((v) => v !== null).length;
  const failCount = Object.values(checklistItems).filter((v) => v === 'fail').length;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/eq/${qrCode}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Daily Inspection</h1>
            <p className="text-sm text-gray-500">
              {equip.name} ({equip.identifier})
            </p>
          </div>
        </div>

        {/* Inspector Name */}
        <Card>
          <CardContent className="pt-6">
            <Label htmlFor="inspector" className="text-sm font-medium">
              Inspector Name *
            </Label>
            <Input
              id="inspector"
              placeholder="Enter your name"
              value={inspectorName}
              onChange={(e) => setInspectorName(e.target.value)}
              className="mt-1.5"
            />
          </CardContent>
        </Card>

        {/* Checklist */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5" />
                Pre-Use Checklist
              </span>
              <span className="text-sm font-normal text-gray-500">
                {completedCount}/{excavatorChecklist.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {excavatorChecklist.map((item) => {
              const status = checklistItems[item.id];
              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    status === 'pass'
                      ? 'bg-green-50 border-green-200'
                      : status === 'fail'
                        ? 'bg-red-50 border-red-200'
                        : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <span className="text-sm font-medium text-gray-700 flex-1">
                    {item.label}
                    {item.required && <span className="text-red-500 ml-1">*</span>}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleStatusChange(item.id, 'pass')}
                      className={`p-2 rounded-full transition-colors ${
                        status === 'pass'
                          ? 'bg-green-500 text-white'
                          : 'bg-white text-gray-400 hover:text-green-500 border'
                      }`}
                    >
                      <CheckCircle2 className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(item.id, 'fail')}
                      className={`p-2 rounded-full transition-colors ${
                        status === 'fail'
                          ? 'bg-red-500 text-white'
                          : 'bg-white text-gray-400 hover:text-red-500 border'
                      }`}
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardContent className="pt-6">
            <Label htmlFor="notes" className="text-sm font-medium">
              Notes {failCount > 0 && <span className="text-red-500">*</span>}
            </Label>
            <p className="text-xs text-gray-500 mb-1.5">
              {failCount > 0
                ? 'Required: Describe issues found'
                : 'Optional: Add any observations'}
            </p>
            <Textarea
              id="notes"
              placeholder="Enter any notes or issues..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Photos */}
        <Card>
          <CardContent className="pt-6">
            <Label className="text-sm font-medium">Photos</Label>
            <p className="text-xs text-gray-500 mb-3">
              Add photos of any damage or issues
            </p>

            <div className="flex flex-wrap gap-2">
              {photos.map((photo, idx) => (
                <div
                  key={photo}
                  className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-xs"
                >
                  Photo {idx + 1}
                </div>
              ))}
              <button
                type="button"
                onClick={handlePhotoAdd}
                className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors"
              >
                <Camera className="h-5 w-5" />
                <span className="text-xs mt-1">Add</span>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <Button
          className="w-full h-14 text-lg"
          size="lg"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <ClipboardCheck className="h-5 w-5 mr-2" />
              Submit Inspection
            </>
          )}
        </Button>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 pt-2 pb-4">
          <p>Powered by HardHat</p>
        </div>
      </div>
    </div>
  );
}
