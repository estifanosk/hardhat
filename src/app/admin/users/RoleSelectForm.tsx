'use client';

const ROLES = ['super_admin', 'safety_admin', 'foreman', 'employee', 'mechanic', 'viewer'] as const;

const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  safety_admin: 'Safety Admin',
  foreman: 'Foreman',
  employee: 'Employee',
  mechanic: 'Mechanic',
  viewer: 'Viewer',
};

export function RoleSelectForm({
  currentRole,
  action,
}: {
  currentRole: string;
  action: (formData: FormData) => Promise<void>;
}) {
  return (
    <form action={action}>
      <select
        name="role"
        defaultValue={currentRole}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="h-7 rounded-md border border-input bg-background px-2 text-xs"
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>{roleLabels[r]}</option>
        ))}
      </select>
      <button type="submit" className="text-xs text-blue-600 hover:underline ml-1">
        Save
      </button>
    </form>
  );
}
