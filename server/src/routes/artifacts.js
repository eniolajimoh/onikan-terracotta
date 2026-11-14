import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

router.get('/', async (request, response, next) => {
  try {
    const page = Math.max(1, Number.parseInt(request.query.page, 10) || 1);
    const limit = Math.min(24, Math.max(1, Number.parseInt(request.query.limit, 10) || 12));
    const search = typeof request.query.search === 'string' ? request.query.search.trim().slice(0, 120) : '';
    const category = typeof request.query.category === 'string' ? request.query.category.trim().slice(0, 80) : '';
    const where = {
      status: 'PUBLISHED',
      ...(search ? {
        OR: [
          { title: { contains: search } },
          { catalogueNumber: { contains: search } },
          { description: { contains: search } },
          { material: { contains: search } },
        ],
      } : {}),
      ...(category ? { categories: { some: { category: { slug: category } } } } : {}),
    };

    const [items, total, categories] = await Promise.all([
      prisma.artifact.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
          categories: { include: { category: true } },
        },
      }),
      prisma.artifact.count({ where }),
      prisma.category.findMany({
        where: { artifacts: { some: { artifact: { status: 'PUBLISHED' } } } },
        orderBy: { name: 'asc' },
        select: { name: true, slug: true },
      }),
    ]);

    response.json({ items, page, limit, total, pages: Math.ceil(total / limit), categories });
  } catch (error) {
    next(error);
  }
});

router.get('/:identifier', async (request, response, next) => {
  try {
    const identifier = request.params.identifier;
    const artifact = await prisma.artifact.findFirst({
      where: {
        status: 'PUBLISHED',
        OR: [{ id: identifier }, { catalogueNumber: identifier }],
      },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        categories: { include: { category: true } },
        references: { include: { reference: true } },
      },
    });

    if (!artifact) return response.status(404).json({ error: 'Artifact not found.' });
    return response.json(artifact);
  } catch (error) {
    return next(error);
  }
});

export default router;
