import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

export async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  const queryToken = req.query.token;
  if (!header?.startsWith('Bearer ') && !queryToken) {
    return res.status(401).json({ message: 'Token não informado.' });
  }

  try {
    const token = queryToken || header.replace('Bearer ', '');
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, email: true, role: true, managedUnitId: true, active: true }
    });

    if (!user?.active) return res.status(401).json({ message: 'Usuário inativo ou não encontrado.' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Token inválido.' });
  }
}

export function requireRoles(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Você não tem permissão para esta ação.' });
    }
    next();
  };
}
