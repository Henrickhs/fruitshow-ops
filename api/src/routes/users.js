import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, requireRoles } from '../middleware/auth.js';

export const userRoutes = Router();

userRoutes.use(authenticate);

userRoutes.get('/', async (req, res) => {
  const where = req.user.role === 'admin' ? {} : { active: true };
  const users = await prisma.user.findMany({
    where,
    select: { id: true, name: true, email: true, role: true, managedUnitId: true, active: true },
    orderBy: { name: 'asc' }
  });
  res.json(users);
});

userRoutes.patch('/:id', requireRoles('admin'), async (req, res) => {
  const { name, role, phone, active, managedUnitId } = req.body;
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { name, role, phone, active, managedUnitId },
    select: { id: true, name: true, email: true, role: true, managedUnitId: true, active: true }
  });
  res.json(user);
});
