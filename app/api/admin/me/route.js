import { NextResponse } from 'next/server';
import { isAdminRequest } from '../../../../lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  return NextResponse.json({ ok: true, email: process.env.ADMIN_EMAIL || 'admin' });
}
