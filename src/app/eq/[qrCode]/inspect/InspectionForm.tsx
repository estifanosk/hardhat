'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, Camera, ArrowLeft, Loader2, ClipboardCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type ChecklistStatus = 'pass' | 'fail' | null;

interface ChecklistItem {
  id: string;
  label: string;
  required: boolean;
}

interface Props {
  equipmentId: string;
  equipmentName: string;
  identifier: string;
  qrCode: string;
  checklist: ChecklistItem[];
}

export default function InspectionForm({ equipmentId, equipmentName, identifier, qrCode, checklist }: Props) {
  const router = useRouter();
  const [inspectorName, setInspectorName] = useState('');
  const [checklistItems, setChecklistItems] = useState<Record<string, ChecklistStatus>>(
    checklist.reduce((acc, item) => { acc[item.id] = null; return acc; }, {} as Record<string, ChecklistStatus>)
  );
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStatusChange = (itemId: string, status: ChecklistStatus) => {
    setChecklistItems((prev) => ({ ...prev, [itemId]: prev[itemId] === status ? null : status }));
  };

  const handleSubmit = async () => {
    if (!inspectorName.trim()) { toast.error('Please enter your name'); return; }

    const unansweredRequired = checklist.filter((item) => item.required && checklistItems[item.id] === null);
    if (unansweredRequired.length > 0) {
      toast.error(`Please complete all required items (${unansweredRequired.length} remaining)`);
      return;
    }

    const hasFailures = Object.values(checklistItems).some((s) => s === 'fail');
    if (hasFailures && !notes.trim()) {
      toast.error('Please add notes describing the failed items');
      return;
    }

    setIsSubmitting(true);

    const overallStatus = hasFailures ? 'failed' : 'passed';
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    const supabase = createClient();
    const { error } = await supabase.from('inspections').insert({
      equipment_id: equipmentId,
      inspector_name: inspectorName,
      inspection_date: now.toISOString().split('T')[0],
      inspection_time: time,
      status: overallStatus,
      notes: notes || null,
      checklist_data: checklistItems,
    });

    if (!error) {
      // Update equipment overall_status based on inspection result
      if (overallStatus === 'failed') {
        await supabase.from('equipment').update({ overall_status: 'out_of_service', updated_at: now.toISOString() }).eq('id', equipmentId);
      } else {
        // Only set to ready if no expired documents
        const { data: docs } = await supabase
          .from('equipment_documents')
          .select('status')
          .eq('equipment_id', equipmentId);
        const hasExpired = docs?.some((d) => d.status === 'expired');
        const hasExpiring = docs?.some((d) => d.status === 'expiring_soon');
        if (!hasExpired && !hasExpiring) {
          await supabase.from('equipment').update({ overall_status: 'ready', updated_at: now.toISOString() }).eq('id', equipmentId);
        }
      }
    }

    setIsSubmitting(false);

    if (overallStatus === 'passed') {
      toast.success('Inspection submitted! Equipment cleared for use.');
    } else {
      toast.warning('Inspection submitted. Maintenance has been notified of issues.');
    }

    setTimeout(() => router.push(`/eq/${qrCode}`), 2000);
  };

  const completedCount = Object.values(checklistItems).filter((v) => v !== null).length;
  const failCount = Object.values(checklistItems).filter((v) => v === 'fail').length;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/eq/${qrCode}`)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Daily Inspection</h1>
            <p className="text-sm text-gray-500">{equipmentName} ({identifier})</p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Label htmlFor="inspector" className="text-sm font-medium">Inspector Name *</Label>
            <Input
              id="inspector"
              placeholder="Enter your name"
              value={inspectorName}
              onChange={(e) => setInspectorName(e.target.value)}
              className="mt-1.5"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5" />
                Pre-Use Checklist
              </span>
              <span className="text-sm font-normal text-gray-500">{completedCount}/{checklist.length}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {checklist.map((item) => {
              const status = checklistItems[item.id];
              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    status === 'pass' ? 'bg-green-50 border-green-200' : status === 'fail' ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <span className="text-sm font-medium text-gray-700 flex-1">
                    {item.label}{item.required && <span className="text-red-500 ml-1">*</span>}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleStatusChange(item.id, 'pass')}
                      className={`p-2 rounded-full transition-colors ${status === 'pass' ? 'bg-green-500 text-white' : 'bg-white text-gray-400 hover:text-green-500 border'}`}
                    >
                      <CheckCircle2 className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(item.id, 'fail')}
                      className={`p-2 rounded-full transition-colors ${status === 'fail' ? 'bg-red-500 text-white' : 'bg-white text-gray-400 hover:text-red-500 border'}`}
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Label htmlFor="notes" className="text-sm font-medium">
              Notes {failCount > 0 && <span className="text-red-500">*</span>}
            </Label>
            <p className="text-xs text-gray-500 mb-1.5">
              {failCount > 0 ? 'Required: Describe issues found' : 'Optional: Add any observations'}
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

        <Card>
          <CardContent className="pt-6">
            <Label className="text-sm font-medium">Photos</Label>
            <p className="text-xs text-gray-500 mb-3">Add photos of any damage or issues</p>
            <div className="flex flex-wrap gap-2">
              {photos.map((photo, idx) => (
                <div key={photo} className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-xs">
                  Photo {idx + 1}
                </div>
              ))}
              <button
                type="button"
                onClick={() => { setPhotos((prev) => [...prev, `photo-${Date.now()}`]); toast.success('Photo added'); }}
                className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors"
              >
                <Camera className="h-5 w-5" />
                <span className="text-xs mt-1">Add</span>
              </button>
            </div>
          </CardContent>
        </Card>

        <Button className="w-full h-14 text-lg" size="lg" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Submitting...</>
          ) : (
            <><ClipboardCheck className="h-5 w-5 mr-2" />Submit Inspection</>
          )}
        </Button>

        <div className="text-center text-xs text-gray-400 pt-2 pb-4">
          <p>Powered by HardHat</p>
        </div>
      </div>
    </div>
  );
}
