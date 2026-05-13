import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { dateOrNull, getPagination, paginated } from '../utils/pagination.js';
import { assertUnitAccess, scopedUnitIds } from '../utils/access.js';

export const projectRoutes = Router();
projectRoutes.use(authenticate);

projectRoutes.get('/', async (req, res) => {
  const { page, pageSize, skip, take } = getPagination(req.query);
  const unitIds = await scopedUnitIds(req.user);
  const where = {
    ...(unitIds ? { OR: [{ unitId: null }, { unitId: { in: unitIds } }] } : {}),
    ...(req.query.status ? { status: req.query.status } : {}),
    ...(req.query.search ? { title: { contains: req.query.search, mode: 'insensitive' } } : {})
  };
  const [data, total] = await Promise.all([
    prisma.project.findMany({ where, include: { unit: true, responsible: { select: { id: true, name: true } }, tasks: true }, skip, take, orderBy: { dueDate: 'asc' } }),
    prisma.project.count({ where })
  ]);
  res.json(paginated(data, total, page, pageSize));
});

projectRoutes.post('/', async (req, res) => {
  await assertUnitAccess(req.user, req.body.unitId);
  const project = await prisma.project.create({
    data: {
      title: req.body.title,
      description: req.body.description,
      unitId: req.body.unitId || null,
      responsibleId: req.body.responsibleId || req.user.id,
      status: req.body.status || 'planning',
      startDate: dateOrNull(req.body.startDate),
      dueDate: dateOrNull(req.body.dueDate),
      tasks: { create: (req.body.tasks || []).map((task) => ({ title: task.title, assignedToId: task.assignedToId, dueDate: dateOrNull(task.dueDate) })) }
    },
    include: { tasks: true }
  });
  res.status(201).json(project);
});

projectRoutes.patch('/:id/tasks/:taskId', async (req, res) => {
  const task = await prisma.projectTask.update({
    where: { id: req.params.taskId },
    data: { status: req.body.status, assignedToId: req.body.assignedToId, dueDate: dateOrNull(req.body.dueDate) }
  });
  res.json(task);
});
