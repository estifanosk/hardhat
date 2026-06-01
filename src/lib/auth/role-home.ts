export const ROLE_HOME: Record<string, string> = {
  super_admin: '/admin',
  safety_admin: '/admin',
  foreman: '/foreman',
  employee: '/employee',
  mechanic: '/mechanic',
  viewer: '/dashboard',
};

export function getRoleHome(role: string | null | undefined) {
  return ROLE_HOME[role ?? ''] ?? '/dashboard';
}
