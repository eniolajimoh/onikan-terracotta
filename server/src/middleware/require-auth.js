import { createHmac, timingSafeEqual } from 'node:crypto';
import { prisma } from '../lib/prisma.js';

const cookieName = 'onikan_session';

function signingSecret() {
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
    throw new Error('SESSION_SECRET must be set to at least 32 characters.');
  }
  return process.env.SESSION_SECRET;
}

function signatureFor(sessionId) {
  return createHmac('sha256', signingSecret()).update(sessionId).digest('base64url');
}

function readSessionId(request) {
  const pair = request.headers.cookie?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${cookieName}=`));
  if (!pair) return null;
  const token = decodeURIComponent(pair.slice(cookieName.length + 1));
  const splitAt = token.lastIndexOf('.');
  if (splitAt < 1) return null;
  const sessionId = token.slice(0, splitAt);
  const provided = Buffer.from(token.slice(splitAt + 1), 'base64url');
  const expected = Buffer.from(signatureFor(sessionId), 'base64url');
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return null;
  return sessionId;
}

export function setSessionCookie(response, sessionId, maxAgeSeconds) {
  const flags = ['Path=/', 'HttpOnly', 'SameSite=Lax', `Max-Age=${maxAgeSeconds}`];
  if (process.env.NODE_ENV === 'production') flags.push('Secure');
  response.setHeader('Set-Cookie', `${cookieName}=${encodeURIComponent(`${sessionId}.${signatureFor(sessionId)}`)}; ${flags.join('; ')}`);
}

export function clearSessionCookie(response) {
  const flags = ['Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=0'];
  if (process.env.NODE_ENV === 'production') flags.push('Secure');
  response.setHeader('Set-Cookie', `${cookieName}=; ${flags.join('; ')}`);
}

export async function requireAuth(request, response, next) {
  try {
    const sessionId = readSessionId(request);
    if (!sessionId) return response.status(401).json({ error: 'Please sign in to continue.' });
    const session = await prisma.session.findUnique({ where: { id: sessionId }, include: { user: true } });
    if (!session || session.expiresAt <= new Date()) {
      if (session) await prisma.session.delete({ where: { id: sessionId } });
      clearSessionCookie(response);
      return response.status(401).json({ error: 'Your session has expired. Please sign in again.' });
    }
    request.user = session.user;
    request.sessionId = sessionId;
    return next();
  } catch (error) {
    return next(error);
  }
}
