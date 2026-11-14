import 'dotenv/config';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { randomBytes, scrypt as scryptCallback } from 'node:crypto';
import { promisify } from 'node:util';
import { prisma } from '../lib/prisma.js';

const scrypt = promisify(scryptCallback);

async function readPassword() {
  if (!stdin.isTTY) throw new Error('Run this command from a terminal so the password can be entered privately.');
  stdout.write('Admin password (12+ characters): ');
  stdin.setRawMode(true);
  stdin.resume();
  stdin.setEncoding('utf8');
  let password = '';
  return new Promise((resolve, reject) => {
    const finish = (error) => {
      stdin.setRawMode(false);
      stdin.pause();
      stdin.removeListener('data', onData);
      stdout.write('\n');
      if (error) reject(error);
      else resolve(password);
    };
    const onData = (character) => {
      if (character === '\u0003') return finish(new Error('Cancelled.'));
      if (character === '\r' || character === '\n') return finish();
      if (character === '\u007f' || character === '\b') {
        password = password.slice(0, -1);
        return;
      }
      password += character;
      stdout.write('•');
    };
    stdin.on('data', onData);
  });
}

const prompt = createInterface({ input: stdin, output: stdout });
try {
  const email = (await prompt.question('Admin email: ')).trim().toLowerCase();
  prompt.close();
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('Enter a valid email address.');
  const password = await readPassword();
  if (password.length < 12) throw new Error('Choose a password with at least 12 characters.');
  const salt = randomBytes(16).toString('hex');
  const derived = await scrypt(password, salt, 64);
  const passwordHash = `scrypt$${salt}$${derived.toString('hex')}`;
  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: 'ADMIN' },
    create: { email, passwordHash, role: 'ADMIN' },
    select: { email: true },
  });
  stdout.write(`Admin account ready for ${user.email}. Sign in at http://localhost:5173/admin\n`);
} catch (error) {
  prompt.close();
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
