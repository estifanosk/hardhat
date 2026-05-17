// Supabase Edge Function — runs on a daily cron schedule
// Checks for certs and equipment documents expiring within 30 days
// and emails all admins via Resend.
//
// Required secrets (set via: supabase secrets set KEY=value):
//   RESEND_API_KEY   — from resend.com
//   ALERT_FROM_EMAIL — e.g. alerts@yourdomain.com
//   APP_URL          — e.g. https://yourapp.com

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const FROM_EMAIL = Deno.env.get('ALERT_FROM_EMAIL') ?? 'alerts@hardhat.app';
const APP_URL = Deno.env.get('APP_URL') ?? 'http://localhost:3000';

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const today = new Date();
  const in30 = new Date(today);
  in30.setDate(in30.getDate() + 30);
  const todayStr = today.toISOString().split('T')[0];
  const in30Str = in30.toISOString().split('T')[0];

  // Expiring / expired certifications
  const { data: certs } = await supabase
    .from('certifications')
    .select('name, expiry_date, status, employees(name, company)')
    .in('status', ['expiring_soon', 'expired'])
    .lte('expiry_date', in30Str)
    .order('expiry_date');

  // Expiring / expired equipment documents
  const { data: docs } = await supabase
    .from('equipment_documents')
    .select('name, expiry_date, status, equipment(name, identifier)')
    .in('status', ['expiring_soon', 'expired'])
    .lte('expiry_date', in30Str)
    .order('expiry_date');

  const totalIssues = (certs?.length ?? 0) + (docs?.length ?? 0);

  if (totalIssues === 0) {
    return new Response(JSON.stringify({ message: 'No expiring items — no alert sent.' }), { status: 200 });
  }

  // Get admin emails
  const { data: admins } = await supabase
    .from('profiles')
    .select('email')
    .eq('role', 'admin');

  if (!admins || admins.length === 0) {
    return new Response(JSON.stringify({ message: 'No admin emails found.' }), { status: 200 });
  }

  const certRows = (certs ?? [])
    .map((c) => {
      const emp = c.employees as unknown as { name: string; company: string } | null;
      const days = Math.ceil((new Date(c.expiry_date!).getTime() - today.getTime()) / 86400000);
      const urgency = days < 0 ? `EXPIRED ${Math.abs(days)}d ago` : `${days}d left`;
      return `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #eee">${emp?.name ?? '—'}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee">${c.name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee">${c.expiry_date}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;color:${days < 0 ? '#dc2626' : '#d97706'};font-weight:600">${urgency}</td>
      </tr>`;
    })
    .join('');

  const docRows = (docs ?? [])
    .map((d) => {
      const eq = d.equipment as unknown as { name: string; identifier: string } | null;
      const days = Math.ceil((new Date(d.expiry_date!).getTime() - today.getTime()) / 86400000);
      const urgency = days < 0 ? `EXPIRED ${Math.abs(days)}d ago` : `${days}d left`;
      return `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #eee">${eq?.identifier ?? '—'} — ${eq?.name ?? '—'}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee">${d.name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee">${d.expiry_date}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;color:${days < 0 ? '#dc2626' : '#d97706'};font-weight:600">${urgency}</td>
      </tr>`;
    })
    .join('');

  const html = `
    <div style="font-family:sans-serif;max-width:640px;margin:0 auto">
      <div style="background:#f97316;padding:20px 24px;border-radius:8px 8px 0 0">
        <h1 style="color:white;margin:0;font-size:20px">⚠️ HardHat Compliance Alert</h1>
        <p style="color:rgba(255,255,255,0.9);margin:4px 0 0">${totalIssues} item${totalIssues !== 1 ? 's' : ''} need attention as of ${todayStr}</p>
      </div>
      <div style="background:white;padding:24px;border:1px solid #eee;border-top:none">

        ${certs && certs.length > 0 ? `
        <h2 style="font-size:16px;margin:0 0 12px">Employee Certifications (${certs.length})</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <thead><tr style="background:#f9fafb">
            <th style="padding:8px 12px;text-align:left;border-bottom:2px solid #e5e7eb">Employee</th>
            <th style="padding:8px 12px;text-align:left;border-bottom:2px solid #e5e7eb">Certification</th>
            <th style="padding:8px 12px;text-align:left;border-bottom:2px solid #e5e7eb">Expiry</th>
            <th style="padding:8px 12px;text-align:left;border-bottom:2px solid #e5e7eb">Status</th>
          </tr></thead>
          <tbody>${certRows}</tbody>
        </table>` : ''}

        ${docs && docs.length > 0 ? `
        <h2 style="font-size:16px;margin:24px 0 12px">Equipment Documents (${docs.length})</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <thead><tr style="background:#f9fafb">
            <th style="padding:8px 12px;text-align:left;border-bottom:2px solid #e5e7eb">Equipment</th>
            <th style="padding:8px 12px;text-align:left;border-bottom:2px solid #e5e7eb">Document</th>
            <th style="padding:8px 12px;text-align:left;border-bottom:2px solid #e5e7eb">Expiry</th>
            <th style="padding:8px 12px;text-align:left;border-bottom:2px solid #e5e7eb">Status</th>
          </tr></thead>
          <tbody>${docRows}</tbody>
        </table>` : ''}

        <div style="margin-top:24px;padding-top:16px;border-top:1px solid #eee">
          <a href="${APP_URL}/admin/employees" style="background:#f97316;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600">
            Open HardHat Admin →
          </a>
        </div>
      </div>
      <p style="color:#9ca3af;font-size:12px;text-align:center;margin-top:16px">
        HardHat — daily compliance digest
      </p>
    </div>
  `;

  // Send to all admins
  const results = await Promise.all(
    admins.map((admin) =>
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: admin.email,
          subject: `[HardHat] ${totalIssues} compliance item${totalIssues !== 1 ? 's' : ''} need attention`,
          html,
        }),
      }).then((r) => r.json())
    )
  );

  return new Response(JSON.stringify({ sent: admins.length, issues: totalIssues, results }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
