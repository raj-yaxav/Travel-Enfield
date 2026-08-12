import crypto from 'crypto';

export const USER_SESSION_COOKIE = 'te_user_session';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function sign(payload) {
  const secret = process.env.USER_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error('USER_SESSION_SECRET or ADMIN_SESSION_SECRET is not configured.');
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

export function createUserSessionToken(userId) {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = `${userId}.${expiresAt}`;
  return { token: `${payload}.${sign(payload)}`, maxAge: Math.floor(SESSION_TTL_MS / 1000) };
}

export function verifyUserSessionToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [userId, expiresAtStr, signature] = parts;
  if (!userId) return null;
  const payload = `${userId}.${expiresAtStr}`;
  const expected = sign(payload);
  const expectedBuf = Buffer.from(expected);
  const signatureBuf = Buffer.from(signature);
  if (expectedBuf.length !== signatureBuf.length) return null;
  if (!crypto.timingSafeEqual(expectedBuf, signatureBuf)) return null;
  const expiresAt = Number(expiresAtStr);
  if (!expiresAt || Date.now() > expiresAt) return null;
  return userId;
}

export function getCurrentUserId(request) {
  const token = request.cookies.get(USER_SESSION_COOKIE)?.value;
  return verifyUserSessionToken(token);
}
