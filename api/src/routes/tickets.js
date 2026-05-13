import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { getPagination, paginated } from '../utils/pagination.js';
import { assertUnitAccess, scopedUnitIds } from '../utils/access.js';

export const ticketRoutes = Router();
ticketRoutes.use(authenticate);

ticketRoutes.get('/', async (req, res) => {
  const { page, pageSize, skip, take } = getPagination(req.query);
  const unitIds = await scopedUnitIds(req.user);
  const where = {
    ...(unitIds ? { unitId: { in: unitIds } } : {}),
    ...(req.query.unitId ? { unitId: req.query.unitId } : {}),
    ...(req.query.status ? { status: req.query.status } : {}),
    ...(req.query.priority ? { priority: req.query.priority } : {}),
    ...(req.query.category ? { category: req.query.category } : {}),
    ...(req.query.search ? { title: { contains: req.query.search, mode: 'insensitive' } } : {})
  };
  const [data, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
      include: { unit: true, createdBy: { select: { id: true, name: true } }, assignedTo: { select: { id: true, name: true } } },
      skip,
      take,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.ticket.count({ where })
  ]);
  res.json(paginated(data, total, page, pageSize));
});

ticketRoutes.post('/', upload.array('attachments'), async (req, res) => {
  await assertUnitAccess(req.user, req.body.unitId);
  const ticket = await prisma.ticket.create({
    data: {
      title: req.body.title,
      description: req.body.description,
      unitId: req.body.unitId,
      category: req.body.category,
      priority: req.body.priority || 'medium',
      createdById: req.user.id,
      assignedToId: req.body.assignedToId || null,
      attachments: {
        create: (req.files || []).map((file) => ({
          fileName: file.originalname,
          fileType: file.mimetype,
          fileSize: file.size,
          storagePath: file.filename
        }))
      }
    },
    include: { attachments: true }
  });
  res.status(201).json(ticket);
});

ticketRoutes.get('/:id', async (req, res) => {
  const unitIds = await scopedUnitIds(req.user);
  const ticket = await prisma.ticket.findFirst({
    where: { id: req.params.id, ...(unitIds ? { unitId: { in: unitIds } } : {}) },
    include: {
      unit: true,
      createdBy: { select: { id: true, name: true } },
      assignedTo: { select: { id: true, name: true } },
      comments: { include: { author: { select: { id: true, name: true } } }, orderBy: { createdAt: 'asc' } },
      attachments: true
    }
  });
  if (!ticket) return res.status(404).json({ message: 'Chamado não encontrado.' });
  res.json(ticket);
});

ticketRoutes.post('/:id/comments', async (req, res) => {
  const ticket = await prisma.ticket.findUnique({ where: { id: req.params.id } });
  if (!ticket) return res.status(404).json({ message: 'Chamado não encontrado.' });
  await assertUnitAccess(req.user, ticket.unitId);
  const comment = await prisma.ticketComment.create({
    data: { ticketId: ticket.id, authorId: req.user.id, content: req.body.content },
    include: { author: { select: { id: true, name: true } } }
  });
  res.status(201).json(comment);
});

ticketRoutes.patch('/:id', async (req, res) => {
  const ticket = await prisma.ticket.findUnique({ where: { id: req.params.id } });
  if (!ticket) return res.status(404).json({ message: 'Chamado não encontrado.' });
  await assertUnitAccess(req.user, ticket.unitId);
  const updated = await prisma.ticket.update({
    where: { id: ticket.id },
    data: {
      status: req.body.status,
      priority: req.body.priority,
      assignedToId: req.body.assignedToId,
      resolvedAt: ['resolved', 'closed'].includes(req.body.status) ? new Date() : undefined
    }
  });
  res.json(updated);
});
