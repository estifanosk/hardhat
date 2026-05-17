import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import InspectionForm from './InspectionForm';

const GENERIC_CHECKLIST = [
  { id: 'ch1', label: 'Engine oil level', required: true },
  { id: 'ch2', label: 'Hydraulic fluid level', required: true },
  { id: 'ch3', label: 'Coolant level', required: true },
  { id: 'ch4', label: 'Undercarriage / tyres condition', required: true },
  { id: 'ch5', label: 'Attachments and working tools', required: true },
  { id: 'ch6', label: 'Safety devices (backup alarm, lights)', required: true },
  { id: 'ch7', label: 'Fire extinguisher present', required: true },
  { id: 'ch8', label: 'Mirrors and windows clean', required: false },
  { id: 'ch9', label: 'Seat belt functional', required: true },
  { id: 'ch10', label: 'No visible leaks', required: true },
];

export default async function InspectionPage({
  params,
}: {
  params: Promise<{ qrCode: string }>;
}) {
  const { qrCode } = await params;
  const supabase = await createClient();

  const { data: equip } = await supabase
    .from('equipment')
    .select('id, name, identifier')
    .eq('qr_code', qrCode)
    .single();

  if (!equip) notFound();

  return (
    <InspectionForm
      equipmentId={equip.id}
      equipmentName={equip.name}
      identifier={equip.identifier}
      qrCode={qrCode}
      checklist={GENERIC_CHECKLIST}
    />
  );
}
