// Supabase Edge Function — runs on a daily cron schedule
//
// Sends role-targeted expiration alerts:
//   super_admin / safety_admin → full digest (certs + equipment docs)
//   foreman                    → crew cert digest only
//   employee                   → own certs only (requires employee-profile link)
//
// Required secrets (set via: supabase secrets set KEY=value):
//   RESEND_API_KEY   — from resend.com
//   ALERT_FROM_EMAIL — e.g. alerts@yourdomain.com
//   APP_URL          — e.g. https://yourapp.com

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const FROM_EMAIL = Deno.env.get('ALERT_FROM_EMAIL') ?? 'alerts@hardhat.app';
const APP_URL = Deno.env.get('APP_URL') ?? 'http://localhost:3000';

type Profile = { email: string; full_name: string | null; role: string };
type Cert = { name: string; expiry_date: string; status: string; employees: { name: string; company: string } | null };
type Doc = { name: string; expiry_date: string; status: string; equipment: { name: string; identifier: string } | null };

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

  // Fetch all expiring/expired certs
  const { data: certs } = await supabase
    .from('certifications')
    .select('name, expiry_date, status, employees(name, company)')
    .in('status', ['expiring_soon', 'expired'])
    .lte('expiry_date', in30Str)
    .order('expiry_date') as { data: Cert[] | null };

  // Fetch all expiring/expired equipment docs
  const { data: docs } = await supabase
    .from('equipment_documents')
    .select('name, expiry_date, status, equipment(name, identifier)')
    .in('status', ['expiring_soon', 'expired'])
    .lte('expiry_date', in30Str)
    .order('expiry_date') as { data: Doc[] | null };

  // Fetch all profiles that should receive alerts
  const { data: profiles } = await supabase
    .from('profiles')
    .select('email, full_name, role')
    .in('role', ['super_admin', 'safety_admin', 'foreman'])
    .not('email', 'is', null) as { data: Profile[] | null };

  if (!profiles || profiles.length === 0) {
    return new Response(JSON.stringify({ message: 'No recipients found.' }), { status: 200 });
  }

  const totalIssues = (certs?.length ?? 0) + (docs?.length ?? 0);
  if (totalIssues === 0) {
    return new Response(JSON.stringify({ message: 'No expiring items — no alert sent.' }), { status: 200 });
  }

  const sentResults: unknown[] = [];

  for (const profile of profiles) {
    const isAdmin = profile.role === 'super_admin' || profile.role === 'safety_admin';
    const isForeman = profile.role === 'foreman';

    const recipientCerts = certs ?? [];
    const recipientDocs = isAdmin ? (docs ?? []) : []; // foremen don't receive equipment doc alerts
    const recipientIssues = recipientCerts.length + recipientDocs.length;

    if (recipientIssues === 0) continue;

    const html = buildEmail({
      recipientName: profile.full_name ?? profile.email,
      role: profile.role,
      certs: recipientCerts,
      docs: recipientDocs,
      today,
      todayStr,
      appUrl: APP_URL,
      isAdmin,
    });

    const subject = isForeman
      ? `[HardHat] ${recipientCerts.length} crew cert${recipientCerts.length !== 1 ? 's' : ''} expiring`
      : `[HardHat] ${recipientIssues} compliance item${recipientIssues !== 1 ? 's' : ''} need attention`;

    const result = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM_EMAIL, to: profile.email, subject, html }),
    }).then((r) => r.json());

    sentResults.push({ email: profile.email, role: profile.role, result });
  }

  return new Response(
    JSON.stringify({ sent: sentResults.length, cert_issues: certs?.length ?? 0, doc_issues: docs?.length ?? 0, results: sentResults }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});

function buildEmail({
  recipientName, role, certs, docs, today, todayStr, appUrl, isAdmin,
}: {
  recipientName: string;
  role: string;
  certs: Cert[];
  docs: Doc[];
  today: Date;
  todayStr: string;
  appUrl: string;
  isAdmin: boolean;
}) {
  const totalIssues = certs.length + docs.length;

  const certRows = certs.map((c) => {
    const days = Math.ceil((new Date(c.expiry_date).getTime() - today.getTime()) / 86400000);
    const urgency = days < 0 ? `EXPIRED ${Math.abs(days)}d ago` : `${days}d left`;
    return `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #eee">${c.employees?.name ?? '—'}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee">${c.name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee">${c.expiry_date}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;color:${days < 0 ? '#dc2626' : '#d97706'};font-weight:600">${urgency}</td>
    </tr>`;
  }).join('');

  const docRows = docs.map((d) => {
    const days = Math.ceil((new Date(d.expiry_date).getTime() - today.getTime()) / 86400000);
    const urgency = days < 0 ? `EXPIRED ${Math.abs(days)}d ago` : `${days}d left`;
    return `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #eee">${d.equipment?.identifier ?? '—'} — ${d.equipment?.name ?? '—'}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee">${d.name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee">${d.expiry_date}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;color:${days < 0 ? '#dc2626' : '#d97706'};font-weight:600">${urgency}</td>
    </tr>`;
  }).join('');

  const roleLabel = role === 'foreman' ? 'Foreman' : 'Admin';
  const ctaUrl = isAdmin ? `${appUrl}/admin/employees` : `${appUrl}/foreman/employees`;

  return `
    <div style="font-family:sans-serif;max-width:640px;margin:0 auto">
      <div style="background:#f97316;padding:20px 24px;border-radius:8px 8px 0 0">
        <h1 style="color:white;margin:0;font-size:20px">⚠️ HardHat Compliance Alert</h1>
        <p style="color:rgba(255,255,255,0.9);margin:4px 0 0">
          Hi ${recipientName} (${roleLabel}) — ${totalIssues} item${totalIssues !== 1 ? 's' : ''} need attention as of ${todayStr}
        </p>
      </div>
      <div style="background:white;padding:24px;border:1px solid #eee;border-top:none">

        ${certs.length > 0 ? `
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

        ${docs.length > 0 ? `
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
          <a href="${ctaUrl}" style="background:#f97316;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600">
            Open HardHat →
          </a>
        </div>
      </div>
      <p style="color:#9ca3af;font-size:12px;text-align:center;margin-top:16px">
        HardHat — daily compliance digest
      </p>
    </div>
  `;
}
