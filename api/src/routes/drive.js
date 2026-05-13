import { Router } from 'express';
import fs from 'node:fs';
import { prisma } from '../lib/prisma.js';
import { authenticate, requireRoles } from '../middleware/auth.js';
import { absoluteUploadPath, upload } from '../middleware/upload.js';
import { getPagination, paginated } from '../utils/pagination.js';
import { assertUnitAccess, scopedUnitIds } from '../utils/access.js';

export const driveRoutes = Router();
driveRoutes.use(authenticate);

driveRoutes.get('/files', async (req, res) => {
  const { page, pageSize, skip, take } = getPagination(req.query);
  const unitIds = await scopedUnitIds(req.user);
  const where = {
    ...(unitIds ? { OR: [{ unitId: null }, { unitId: { in: unitIds } }] } : {}),
    ...(req.query.unitId === 'global' ? { unitId: null } : req.query.unitId ? { unitId: req.query.unitId } : {}),
    ...(req.query.folderPath ? { folderPath: req.query.folderPath } : {}),
    ...(req.query.search ? { fileName: { contains: req.query.search, mode: 'insensitive' } } : {})
  };
  const [data, total] = await Promise.all([
    prisma.driveFile.findMany({ where, include: { unit: true, uploadedBy: { select: { id: true, name: true } } }, skip, take, orderBy: { createdAt: 'desc' } }),
    prisma.driveFile.count({ where })
  ]);
  res.json(paginated(data, total, page, pageSize));
});

driveRoutes.post('/files', upload.single('file'), async (req, res) => {
  await assertUnitAccess(req.user, req.body.unitId || null);
  if (!req.file) return res.status(400).json({ message: 'Arquivo não informado.' });
  const file = await prisma.driveFile.create({
    data: {
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      storagePath: req.file.filename,
      uploadedById: req.user.id,
      unitId: req.body.unitId || null,
      folderPath: req.body.folderPath || '/'
    }
  });
  res.status(201).json(file);
});

driveRoutes.get('/files/:id/download', async (req, res) => {
  const file = await prisma.driveFile.findUnique({ where: { id: req.params.id } });
  if (!file) return res.status(404).json({ message: 'Arquivo não encontrado.' });
  await assertUnitAccess(req.user, file.unitId);
  res.download(absoluteUploadPath(file.storagePath), file.fileName);
});

driveRoutes.delete('/files/:id', requireRoles('admin', 'supervisor'), async (req, res) => {
  const file = await prisma.driveFile.findUnique({ where: { id: req.params.id } });
  if (!file) return res.status(404).json({ message: 'Arquivo não encontrado.' });
  await assertUnitAccess(req.user, file.unitId);
  await prisma.driveFile.delete({ where: { id: file.id } });
  fs.rm(absoluteUploadPath(file.storagePath), { force: true }, () => {});
  res.status(204).end();
});
