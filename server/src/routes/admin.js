import { Router } from 'express';
import { createHash, randomBytes } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/require-auth.js';
import { requireRole } from '../middleware/require-role.js';

const router = Router();
const canManageArtifacts = requireRole('ADMIN', 'EDITOR');
const uploadsDirectory = fileURLToPath(new URL('../../uploads/', import.meta.url));

router.use(requireAuth, canManageArtifacts);

router.get('/artifacts', async (_request, response, next) => {
  try {
    const items = await prisma.artifact.findMany({
      orderBy: { updatedAt: 'desc' },
      include: { images: { orderBy: { sortOrder: 'asc' } } },
    });
    response.json({ items });
  } catch (error) {
    next(error);
  }
});

router.post('/artifacts', async (request, response, next) => {
  try {
    const data = request.body;
    if (!data.title?.trim() || !data.catalogueNumber?.trim() || !data.description?.trim()) {
      return response.status(400).json({ error: 'Title, catalogue number, and description are required.' });
    }
    const artifact = await prisma.artifact.create({ data: artifactData(data) });
    return response.status(201).json({ artifact });
  } catch (error) {
    if (error.code === 'P2002') return response.status(409).json({ error: 'That catalogue number is already in use.' });
    return next(error);
  }
});

router.patch('/artifacts/:id', async (request, response, next) => {
  try {
    const artifact = await prisma.artifact.update({
      where: { id: request.params.id },
      data: artifactData(request.body),
    });
    return response.json({ artifact });
  } catch (error) {
    if (error.code === 'P2002') return response.status(409).json({ error: 'That catalogue number is already in use.' });
    if (error.code === 'P2025') return response.status(404).json({ error: 'Artifact not found.' });
    return next(error);
  }
});

router.post('/artifacts/:id/images', async (request, response, next) => {
  try {
    const artifact = await prisma.artifact.findUnique({ where: { id: request.params.id }, select: { id: true } });
    if (!artifact) return response.status(404).json({ error: 'Artifact not found.' });

    if (typeof request.body.url === 'string') {
      let imageUrl;
      try { imageUrl = new URL(request.body.url); } catch { return response.status(400).json({ error: 'Invalid image URL.' }); }
      if (imageUrl.protocol !== 'https:' || imageUrl.hostname !== 'res.cloudinary.com' || typeof request.body.publicId !== 'string' || !request.body.publicId.startsWith('onikan-artifacts/')) {
        return response.status(400).json({ error: 'Images must be uploaded to the configured Cloudinary account.' });
      }
      const image = await prisma.artifactImage.create({
        data: {
          artifactId: artifact.id,
          url: imageUrl.toString(),
          publicId: request.body.publicId,
          altText: typeof request.body.altText === 'string' ? request.body.altText.slice(0, 180) : null,
        },
      });
      return response.status(201).json({ image });
    }

    const match = typeof request.body.dataUrl === 'string'
      ? request.body.dataUrl.match(/^data:image\/(png|jpe?g|webp);base64,([A-Za-z0-9+/=]+)$/i)
      : null;
    if (!match) return response.status(400).json({ error: 'Choose a PNG, JPG, or WebP image.' });
    const extension = match[1].toLowerCase() === 'jpeg' ? 'jpg' : match[1].toLowerCase();
    const file = Buffer.from(match[2], 'base64');
    if (!file.length || file.length > 8 * 1024 * 1024) return response.status(413).json({ error: 'Images must be 8 MB or smaller.' });

    const stored = await storeImage(file, extension);
    const image = await prisma.artifactImage.create({
      data: {
        artifactId: artifact.id,
        url: stored.url,
        publicId: stored.publicId,
        altText: typeof request.body.altText === 'string' ? request.body.altText.slice(0, 180) : null,
      },
    });
    return response.status(201).json({ image });
  } catch (error) {
    return next(error);
  }
});

router.post('/artifacts/:id/images/signature', async (request, response, next) => {
  try {
    const artifact = await prisma.artifact.findUnique({ where: { id: request.params.id }, select: { id: true } });
    if (!artifact) return response.status(404).json({ error: 'Artifact not found.' });
    const { CLOUDINARY_CLOUD_NAME: cloudName, CLOUDINARY_API_KEY: apiKey, CLOUDINARY_API_SECRET: apiSecret } = process.env;
    if (!cloudName || !apiKey || !apiSecret) return response.status(503).json({ error: 'Cloudinary must be configured before production uploads are available.' });

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = 'onikan-artifacts';
    const publicId = `${folder}/${randomBytes(18).toString('hex')}`;
    const signedParameters = { folder, public_id: publicId, timestamp };
    const signatureInput = Object.keys(signedParameters).sort().map((key) => `${key}=${signedParameters[key]}`).join('&');
    const signature = createHash('sha1').update(`${signatureInput}${apiSecret}`).digest('hex');
    return response.json({ cloudName, apiKey, timestamp, folder, publicId, signature });
  } catch (error) {
    return next(error);
  }
});

router.delete('/artifacts/:id/images/:imageId', async (request, response, next) => {
  try {
    const image = await prisma.artifactImage.findFirst({ where: { id: request.params.imageId, artifactId: request.params.id } });
    if (!image) return response.status(404).json({ error: 'Image not found.' });
    await prisma.artifactImage.delete({ where: { id: image.id } });
    return response.json({ ok: true });
  } catch (error) {
    return next(error);
  }
});

function artifactData(input) {
  const dimensions = ['height', 'width', 'length'];
  const data = {
    title: typeof input.title === 'string' ? input.title.trim().slice(0, 200) : undefined,
    catalogueNumber: typeof input.catalogueNumber === 'string' ? input.catalogueNumber.trim().slice(0, 100) : undefined,
    description: typeof input.description === 'string' ? input.description.trim() : undefined,
    material: nullableText(input.material),
    culture: nullableText(input.culture),
    geographicalOrigin: nullableText(input.geographicalOrigin),
    estimatedPeriod: nullableText(input.estimatedPeriod),
    provenance: nullableText(input.provenance),
    conservationStatus: nullableText(input.conservationStatus),
    interpretiveNotes: nullableText(input.interpretiveNotes),
    status: ['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(input.status) ? input.status : undefined,
  };
  for (const field of dimensions) {
    if (input[field] !== undefined) data[field] = input[field] === '' || input[field] === null ? null : Number(input[field]);
  }
  return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));
}

function nullableText(value) {
  if (value === undefined) return undefined;
  if (typeof value !== 'string') return null;
  return value.trim() ? value.trim().slice(0, 12000) : null;
}

async function storeImage(file, extension) {
  const { CLOUDINARY_CLOUD_NAME: cloudName, CLOUDINARY_API_KEY: apiKey, CLOUDINARY_API_SECRET: apiSecret } = process.env;
  if (cloudName && apiKey && apiSecret) {
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = 'onikan-artifacts';
    const signature = createHash('sha1').update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`).digest('hex');
    const body = new FormData();
    body.append('file', new Blob([file], { type: `image/${extension === 'jpg' ? 'jpeg' : extension}` }), `artifact.${extension}`);
    body.append('api_key', apiKey);
    body.append('timestamp', String(timestamp));
    body.append('folder', folder);
    body.append('signature', signature);
    const upload = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`, { method: 'POST', body });
    const result = await upload.json();
    if (!upload.ok) throw new Error(result.error?.message || 'Image storage failed.');
    return { url: result.secure_url, publicId: result.public_id };
  }

  if (process.env.NODE_ENV === 'production') throw new Error('Configure Cloudinary before accepting production uploads.');
  await mkdir(uploadsDirectory, { recursive: true });
  const filename = `${randomBytes(18).toString('hex')}.${extension}`;
  await writeFile(path.join(uploadsDirectory, filename), file, { flag: 'wx' });
  return { url: `/uploads/${filename}`, publicId: null };
}

export default router;
