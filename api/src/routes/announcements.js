import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, requireRoles } from '../middleware/auth.js';
import { getPagination, paginated } from '../utils/pagination.js';
import { scopedUnitIds } from '../utils/access.js';

export const announcementRoutes = Router();
announcementRoutes.use(authenticate);

announcementRoutes.get('/', async (req, res) => {
  const { page, pageSize, skip, take } = getPagination(req.query);
  const unitIds = await scopedUnitIds(req.user);
  const visibility = [
    { targetAudience: 'all' },
    ...(req.user.role === 'supervisor' ? [{ targetAudience: 'supervisors' }] : []),
    ...(unitIds ? [{ targetUnits: { some: { unitId: { in: unitIds } } } }] : [])
  ];
  const where = { OR: visibility, ...(req.query.search ? { title: { contains: req.query.search, mode: 'insensitive' } } : {}) };
  const [data, total] = await Promise.all([
    prisma.announcement.findMany({
      where,
      include: { author: { select: { id: true, name: true } }, readReceipts: { where: { userId: req.user.id } }, targetUnits: true },
      skip,
      take,
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }]
    }),
    prisma.announcement.count({ where })
  ]);
  res.json(paginated(data.map((item) => ({ ...item, read: item.readReceipts.length > 0 })), total, page, pageSize));
});

announcementRoutes.post('/', requireRoles('admin', 'supervisor'), async (req, res) => {
  const announcement = await prisma.announcement.create({
    data: {
      title: req.body.title,
      content: req.body.content,
      authorId: req.user.id,
      targetAudience: req.body.targetAudience || 'all',
      pinned: Boolean(req.body.pinned),
      targetUnits: { create: (req.body.specificUnitIds || []).map((unitId) => ({ unitId })) }
    },
    include: { targetUnits: true }
  });
  res.status(201).json(announcement);
});

announcementRoutes.post('/:id/read', async (req, res) => {
  const receipt = await prisma.announcementRead.upsert({
    where: { announcementId_userId: { announcementId: req.params.id, userId: req.user.id } },
    update: { readAt: new Date() },
    create: { announcementId: req.params.id, userId: req.user.id }
  });
  res.json(receipt);
});
