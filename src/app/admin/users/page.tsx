import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createUser, updateUserPassword, updateUserRole, deactivateUser, reactivateUser } from './actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, UserPlus, Shield } from 'lucide-react';
import { RoleSelectForm } from './RoleSelectForm';

const PAGE_SIZE = 10;

const ROLES = ['super_admin', 'safety_admin', 'foreman', 'employee', 'mechanic', 'viewer'] as const;

const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  safety_admin: 'Safety Admin',
  foreman: 'Foreman',
  employee: 'Employee',
  mechanic: 'Mechanic',
  viewer: 'Viewer',
};

const roleBadgeColor: Record<string, string> = {
  super_admin: 'bg-purple-100 text-purple-700',
  safety_admin: 'bg-blue-100 text-blue-700',
  foreman: 'bg-orange-100 text-orange-700',
  employee: 'bg-green-100 text-green-700',
  mechanic: 'bg-yellow-100 text-yellow-700',
  viewer: 'bg-gray-100 text-gray-600',
};

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; created?: string; password?: string; page?: string }>;
}) {
  // Only super_admin can access this page
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (currentProfile?.role !== 'super_admin') redirect('/admin/employees');

  const { error, created, password, page: pageParam } = await searchParams;
  const requestedPage = Number.parseInt(pageParam ?? '1', 10);
  const parsedPage = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  // Fetch all profiles + ban status from auth
  const admin = createAdminClient();
  const { count: totalCount } = await admin
    .from('profiles')
    .select('id', { count: 'exact', head: true });

  const totalUsers = totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalUsers / PAGE_SIZE));
  const currentPage = Math.min(parsedPage, totalPages);
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const pageStart = totalUsers === 0 ? 0 : from + 1;
  const pageEnd = Math.min(to + 1, totalUsers);
  const makePageHref = (page: number) => `/admin/users?page=${page}`;

  const { data: authUsers } = await admin.auth.admin.listUsers();
  const { data: profiles } = await admin
    .from('profiles')
    .select('id, email, full_name, role, created_at')
    .order('created_at', { ascending: false })
    .range(from, to);

  // Merge profile data with ban status from auth
  const users = (profiles ?? []).map((profile) => {
    const authUser = authUsers?.users.find((u) => u.id === profile.id);
    return {
      ...profile,
      banned: !!authUser?.banned_until,
      last_sign_in: authUser?.last_sign_in_at ?? null,
    };
  });

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Invite team members and manage their roles.</p>
        </div>
      </div>

      {created && (
        <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-md border border-green-200">
          User created. Share the password with them directly.
        </p>
      )}
      {password && (
        <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-md border border-green-200">
          Password updated.
        </p>
      )}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{error}</p>
      )}

      {/* Invite form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Create a user
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createUser} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Full name</Label>
              <Input name="full_name" placeholder="John Smith" className="h-8 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input name="email" type="email" placeholder="john@company.com" required className="h-8 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Password</Label>
              <Input
                name="password"
                type="password"
                placeholder="Minimum 8 characters"
                required
                minLength={8}
                className="h-8 text-sm"
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Role</Label>
              <select
                name="role"
                required
                className="h-8 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{roleLabels[r]}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-4 flex justify-end pt-1">
              <Button type="submit" size="sm" className="gap-1.5">
                <UserPlus className="h-3.5 w-3.5" />
                Create user
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* User list */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Team members
            <span className="text-sm font-normal text-gray-400">({totalUsers})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y">
            {users.map((u) => {
              const updateRole = updateUserRole.bind(null, u.id);
              const updatePassword = updateUserPassword.bind(null, u.id);
              const deactivate = deactivateUser.bind(null, u.id);
              const reactivate = reactivateUser.bind(null, u.id);

              return (
                <li key={u.id} className={`flex items-center justify-between px-4 py-3 ${u.banned ? 'bg-gray-50 opacity-60' : ''}`}>
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">
                      {u.full_name || u.email}
                      {u.id === user.id && (
                        <span className="ml-2 text-xs text-gray-400">(you)</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{u.email}</p>
                    {u.last_sign_in && (
                      <p className="text-xs text-gray-400">
                        Last sign in: {new Date(u.last_sign_in).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    {u.banned ? (
                      <Badge className="bg-red-100 text-red-700 text-xs">Deactivated</Badge>
                    ) : (
                      <Badge className={`text-xs ${roleBadgeColor[u.role] ?? 'bg-gray-100 text-gray-600'}`}>
                        {roleLabels[u.role] ?? u.role}
                      </Badge>
                    )}

                    {/* Role change — not for self */}
                    {u.id !== user.id && !u.banned && (
                      <>
                        <RoleSelectForm
                          currentRole={u.role}
                          action={async (formData) => {
                            'use server';
                            const role = formData.get('role') as string;
                            await updateRole(role as Parameters<typeof updateUserRole>[1]);
                          }}
                        />
                        <form action={updatePassword} className="flex items-center gap-1">
                          <Input
                            name="password"
                            type="password"
                            placeholder="New password"
                            required
                            minLength={8}
                            className="h-8 w-32 text-xs"
                            autoComplete="new-password"
                          />
                          <Button type="submit" variant="outline" size="sm" className="h-8 text-xs">
                            Set
                          </Button>
                        </form>
                      </>
                    )}

                    {/* Deactivate / reactivate — not for self */}
                    {u.id !== user.id && (
                      u.banned ? (
                        <form action={reactivate}>
                          <button type="submit" className="text-xs text-green-600 hover:underline">
                            Reactivate
                          </button>
                        </form>
                      ) : (
                        <form action={deactivate}>
                          <button type="submit" className="text-xs text-red-500 hover:underline">
                            Deactivate
                          </button>
                        </form>
                      )
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      {totalUsers > PAGE_SIZE && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">
            Showing {pageStart}-{pageEnd} of {totalUsers}
          </p>
          <div className="flex items-center gap-2">
            {currentPage > 1 ? (
              <Link href={makePageHref(currentPage - 1)}>
                <Button variant="outline" size="sm" className="gap-1">
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
              </Link>
            ) : (
              <Button variant="outline" size="sm" className="gap-1" disabled>
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
            )}
            <span className="min-w-20 text-center text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            {currentPage < totalPages ? (
              <Link href={makePageHref(currentPage + 1)}>
                <Button variant="outline" size="sm" className="gap-1">
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Button variant="outline" size="sm" className="gap-1" disabled>
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
