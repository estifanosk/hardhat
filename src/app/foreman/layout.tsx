import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { logout } from '@/app/login/actions';
import { HardHat, Users, Truck, LogOut } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function ForemanLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, email')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'foreman') redirect('/login');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/foreman" className="flex items-center gap-2">
              <div className="bg-orange-500 p-1.5 rounded-lg">
                <HardHat className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-gray-900">HardHat</span>
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                Foreman
              </span>
            </Link>
            <nav className="hidden sm:flex items-center gap-4 text-sm">
              <Link href="/foreman/employees" className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 font-medium">
                <Users className="h-4 w-4" />
                Crew
              </Link>
              <Link href="/foreman/equipment" className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 font-medium">
                <Truck className="h-4 w-4" />
                Equipment
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:block">
              {profile.full_name || profile.email}
            </span>
            <form action={logout}>
              <Button variant="ghost" size="sm" type="submit" className="gap-1.5">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
