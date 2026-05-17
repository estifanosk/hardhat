import { createEmployee } from '../actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewEmployeePage() {
  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/employees">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Add Employee</h1>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Employee details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createEmployee} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" name="name" placeholder="John Smith" required />
              <p className="text-xs text-gray-400">As it appears on their ID or certification documents.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role">Job title / role</Label>
              <Input id="role" name="role" placeholder="Crane Operator" required />
              <p className="text-xs text-gray-400">e.g. Crane Operator, Electrician, Site Supervisor.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company">Company</Label>
              <Input id="company" name="company" placeholder="ABC Construction" required />
              <p className="text-xs text-gray-400">The subcontractor or employer this worker belongs to.</p>
            </div>
            <p className="text-xs text-gray-400 pt-1">A unique QR code is generated automatically. You can add certifications after creating the employee.</p>
            <div className="pt-2 flex gap-3">
              <Button type="submit" className="flex-1">Create employee</Button>
              <Link href="/admin/employees">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
