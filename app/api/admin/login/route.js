import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, createAdminSessionToken } from '../../../../lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const email = (body?.email || '').trim().toLowerCase();
  const password = body?.password || '';

  const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const adminHash = process.env.ADMIN_PASSWORD_HASH;
  if (!adminEmail || !adminHash) {
    return NextResponse.json({ error: 'Admin login is not configured. Set ADMIN_EMAIL and ADMIN_PASSWORD_HASH.' }, { status: 500 });
  }

  if (email !== adminEmail || !(await bcrypt.compare(password, adminHash))) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  const { token, maxAge } = createAdminSessionToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge,
  });
  return response;
}
