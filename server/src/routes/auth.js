import { Router } from 'express';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { prisma } from '../lib/prisma.js';
import { clearSessionCookie, requireAuth, setSessionCookie } from '../middleware/require-auth.js';

const router = Router();
const scrypt = promisify(scryptCallback);
const sessionLengthSeconds = 60 * 60 * 24 * 7;
const loginAttempts = new Map();

function passwordMatches(password, storedHash) {
  const [algorithm, salt, hash] = storedHash.split('$');
  if (algorithm !== 'scrypt' || !salt || !hash) return false;
  return scrypt(password, salt, 64).then((derived) => {
    const expected = Buffer.from(hash, 'hex');
    return expected.length === derived.length && timingSafeEqual(expected, derived);
  });
}

router.post('/login', async (request, response, next) => {
  const now = Date.now();
  const key = request.ip || 'unknown';
  const windowMs = 15 * 60 * 1000;
  const attempts = loginAttempts.get(key);
  if (attempts && now - attempts.startedAt < windowMs && attempts.count >= 8) {
    return response.status(429).json({ error: 'Too many attempts. Please wait a few minutes and try again.' });
  }

  try {
    const email = typeof request.body.email === 'string' ? request.body.email.trim().toLowerCase() : '';
    const password = typeof request.body.password === 'string' ? request.body.password : '';
    const user = email ? await prisma.user.findUnique({ where: { email } }) : null;
    const valid = user ? await passwordMatches(password, user.passwordHash) : false;
    if (!valid) {
      const current = loginAttempts.get(key);
      loginAttempts.set(key, current && now - current.startedAt < windowMs
        ? { ...current, count: current.count + 1 }
        : { startedAt: now, count: 1 });
      return response.status(401).json({ error: 'Email or password is incorrect.' });
    }

    loginAttempts.delete(key);
    const id = randomBytes(32).toString('base64url');
    const expiresAt = new Date(now + sessionLengthSeconds * 1000);
    await prisma.session.create({ data: { id, userId: user.id, expiresAt } });
    setSessionCookie(response, id, sessionLengthSeconds);
    return response.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    return next(error);
  }
});

router.get('/me', requireAuth, (request, response) => {
  const { id, email, name, role } = request.user;
  response.json({ user: { id, email, name, role } });
});

router.post('/logout', requireAuth, async (request, response, next) => {
  try {
    await prisma.session.delete({ where: { id: request.sessionId } });
    clearSessionCookie(response);
    return response.json({ ok: true });
  } catch (error) {
    return next(error);
  }
});

export default router;
