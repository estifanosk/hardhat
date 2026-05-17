import { createEquipment } from '../actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const EQUIPMENT_TYPES = ['Excavator', 'Crane', 'Forklift', 'Loader', 'Bulldozer', 'Compactor', 'Generator', 'Scissor Lift', 'Boom Lift', 'Other'];

export default function NewEquipmentPage() {
  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/equipment">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Add Equipment</h1>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Equipment details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createEquipment} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="CAT 320 Excavator" required />
              <p className="text-xs text-gray-400">Make and model, e.g. CAT 320 Excavator.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                name="type"
                required
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Select type...</option>
                {EQUIPMENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="identifier">Unit ID</Label>
              <Input id="identifier" name="identifier" placeholder="EQ-042" required />
              <p className="text-xs text-gray-400">Your internal unit number or serial number used to identify this equipment.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="site">Job site</Label>
              <Input id="site" name="site" placeholder="Downtown Tower Project" required />
              <p className="text-xs text-gray-400">The current job site where this equipment is deployed.</p>
            </div>
            <p className="text-xs text-gray-400 pt-1">A unique QR code is generated automatically. You can add documents and run inspections after creating the equipment.</p>
            <div className="pt-2 flex gap-3">
              <Button type="submit" className="flex-1">Create equipment</Button>
              <Link href="/admin/equipment">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
