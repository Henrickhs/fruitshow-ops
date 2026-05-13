import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { authenticate, requireRoles } from '../middleware/auth.js';

export const authRoutes = Router();

function publicUser(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

function sign(user) {
  return jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' });
}

authRoutes.post('/register', authenticate, requireRoles('admin'), async (req, res) => {
  const { name, email, password, role = 'unit_manager', managedUnitId, phone } = req.body;
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { name, email, passwordHash, role, managedUnitId, phone } });
  res.status(201).json(publicUser(user));
});

authRoutes.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
  }
  if (!user.active) return res.status(403).json({ message: 'Usuário inativo.' });
  res.json({ token: sign(user), user: publicUser(user) });
});

authRoutes.get('/me', authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  res.json(publicUser(user));
});

