export const ROLE_HOME: Record<string, string> = {
  super_admin: '/admin/employees',
  safety_admin: '/admin/employees',
  foreman: '/foreman',
  employee: '/employee',
  mechanic: '/mechanic',
  viewer: '/dashboard',
};

export function getRoleHome(role: string | null | undefined) {
  return ROLE_HOME[role ?? ''] ?? '/dashboard';
}
