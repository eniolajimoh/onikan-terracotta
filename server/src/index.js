import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { fileURLToPath } from 'node:url';
import adminRouter from './routes/admin.js';
import authRouter from './routes/auth.js';
import artifactsRouter from './routes/artifacts.js';
import { prisma } from './lib/prisma.js';

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '12mb' }));
app.use('/uploads', express.static(fileURLToPath(new URL('../uploads/', import.meta.url))));
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/artifacts', artifactsRouter);

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', service: 'onikan-api' });
});

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ error: 'The request could not be completed.' });
});

const server = app.listen(port, () => {
  console.log(`Onikan API listening on http://localhost:${port}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, async () => {
    server.close();
    await prisma.$disconnect();
    process.exit(0);
  });
}
