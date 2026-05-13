import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, requireRoles } from '../middleware/auth.js';
import { dateOrNull, getPagination, paginated } from '../utils/pagination.js';
import { assertUnitAccess, scopedUnitIds } from '../utils/access.js';

export const onboardingRoutes = Router();
onboardingRoutes.use(authenticate);

onboardingRoutes.get('/templates', async (_req, res) => {
  const templates = await prisma.onboardingStepTemplate.findMany({ where: { active: true }, orderBy: { order: 'asc' } });
  res.json(templates);
});

onboardingRoutes.post('/templates', requireRoles('admin', 'supervisor'), async (req, res) => {
  const template = await prisma.onboardingStepTemplate.create({ data: req.body });
  res.status(201).json(template);
});

onboardingRoutes.get('/plans', async (req, res) => {
  const { page, pageSize, skip, take } = getPagination(req.query);
  const unitIds = await scopedUnitIds(req.user);
  const where = { ...(unitIds ? { unitId: { in: unitIds } } : {}), ...(req.query.status ? { status: req.query.status } : {}) };
  const [data, total] = await Promise.all([
    prisma.onboardingPlan.findMany({
      where,
      include: { unit: true, responsible: { select: { id: true, name: true } }, steps: { orderBy: { order: 'asc' } } },
      skip,
      take,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.onboardingPlan.count({ where })
  ]);
  res.json(paginated(data, total, page, pageSize));
});

onboardingRoutes.post('/plans', requireRoles('admin', 'supervisor'), async (req, res) => {
  await assertUnitAccess(req.user, req.body.unitId);
  const templates = await prisma.onboardingStepTemplate.findMany({ where: { active: true }, orderBy: { order: 'asc' } });
  const start = req.body.startDate ? new Date(req.body.startDate) : new Date();
  const plan = await prisma.onboardingPlan.create({
    data: {
      unitId: req.body.unitId,
      responsibleId: req.body.responsibleId || req.user.id,
      startDate: start,
      expectedCompletionDate: dateOrNull(req.body.expectedCompletionDate),
      status: 'in_progress',
      steps: {
        create: templates.map((step) => ({
          title: step.title,
          description: step.description,
          category: step.category,
          order: step.order,
          dueDate: new Date(start.getTime() + step.defaultDays * 86400000)
        }))
      }
    },
    include: { steps: true, unit: true }
  });
  res.status(201).json(plan);
});

onboardingRoutes.patch('/plans/:planId/steps/:stepId', requireRoles('admin', 'supervisor'), async (req, res) => {
  const step = await prisma.onboardingStep.update({
    where: { id: req.params.stepId },
    data: {
      status: req.body.status,
      notes: req.body.notes,
      completedAt: req.body.status === 'completed' ? new Date() : null
    }
  });
  const steps = await prisma.onboardingStep.findMany({ where: { planId: req.params.planId } });
  const completed = steps.filter((item) => item.status === 'completed').length;
  if (steps.length && completed === steps.length) {
    await prisma.onboardingPlan.update({ where: { id: req.params.planId }, data: { status: 'completed' } });
  }
  res.json(step);
});
