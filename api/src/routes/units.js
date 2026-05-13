import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, requireRoles } from '../middleware/auth.js';
import { getPagination, paginated, dateOrNull } from '../utils/pagination.js';
import { scopedUnitWhere } from '../utils/access.js';

export const unitRoutes = Router();
unitRoutes.use(authenticate);

unitRoutes.get('/', async (req, res) => {
  const { page, pageSize, skip, take } = getPagination(req.query);
  const where = await scopedUnitWhere(req.user, {
    ...(req.query.city ? { city: { contains: req.query.city, mode: 'insensitive' } } : {}),
    ...(req.query.status ? { status: req.query.status } : {}),
    ...(req.query.search ? {
      OR: [
        { name: { contains: req.query.search, mode: 'insensitive' } },
        { cnpj: { contains: req.query.search, mode: 'insensitive' } },
        { responsibleName: { contains: req.query.search, mode: 'insensitive' } }
      ]
    } : {})
  });
  const [data, total] = await Promise.all([
    prisma.unit.findMany({ where, include: { supervisor: { select: { id: true, name: true } } }, skip, take, orderBy: { name: 'asc' } }),
    prisma.unit.count({ where })
  ]);
  res.json(paginated(data, total, page, pageSize));
});

unitRoutes.get('/:id', async (req, res) => {
  const where = await scopedUnitWhere(req.user, { id: req.params.id });
  const unit = await prisma.unit.findFirst({
    where,
    include: {
      supervisor: { select: { id: true, name: true } },
      managers: { select: { id: true, name: true, email: true } },
      tickets: { take: 5, orderBy: { createdAt: 'desc' } },
      onboardingPlans: { include: { steps: true } }
    }
  });
  if (!unit) return res.status(404).json({ message: 'Unidade não encontrada.' });
  res.json(unit);
});

unitRoutes.post('/', requireRoles('admin', 'supervisor'), async (req, res) => {
  const unit = await prisma.unit.create({
    data: {
      name: req.body.name,
      cnpj: req.body.cnpj,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      phone: req.body.phone,
      status: req.body.status || 'implantation',
      openingDate: dateOrNull(req.body.openingDate),
      responsibleName: req.body.responsibleName,
      teamId: req.body.teamId,
      supervisorId: req.body.supervisorId
    }
  });
  res.status(201).json(unit);
});

unitRoutes.put('/:id', requireRoles('admin', 'supervisor'), async (req, res) => {
  const unit = await prisma.unit.update({
    where: { id: req.params.id },
    data: {
      name: req.body.name,
      cnpj: req.body.cnpj,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      phone: req.body.phone,
      status: req.body.status,
      openingDate: dateOrNull(req.body.openingDate),
      responsibleName: req.body.responsibleName,
      teamId: req.body.teamId,
      supervisorId: req.body.supervisorId
    }
  });
  res.json(unit);
});

unitRoutes.patch('/:id/supervisor', requireRoles('admin'), async (req, res) => {
  const unit = await prisma.unit.update({ where: { id: req.params.id }, data: { supervisorId: req.body.supervisorId } });
  res.json(unit);
});
