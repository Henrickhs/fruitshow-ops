import { prisma } from '../lib/prisma.js';

export async function scopedUnitWhere(user, base = {}) {
  if (user.role === 'admin') return base;
  if (user.role === 'unit_manager') return { ...base, id: user.managedUnitId || '__none__' };
  const units = await prisma.unit.findMany({ where: { supervisorId: user.id }, select: { id: true } });
  return { ...base, id: { in: units.map((unit) => unit.id) } };
}

export async function scopedUnitIds(user) {
  if (user.role === 'admin') return null;
  if (user.role === 'unit_manager') return user.managedUnitId ? [user.managedUnitId] : [];
  const units = await prisma.unit.findMany({ where: { supervisorId: user.id }, select: { id: true } });
  return units.map((unit) => unit.id);
}

export async function assertUnitAccess(user, unitId) {
  if (!unitId || user.role === 'admin') return;
  const allowed = await scopedUnitIds(user);
  if (!allowed.includes(unitId)) {
    const error = new Error('Você não tem acesso a esta unidade.');
    error.status = 403;
    throw error;
  }
}
