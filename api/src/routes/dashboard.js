import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { scopedUnitIds, scopedUnitWhere } from '../utils/access.js';

export const dashboardRoutes = Router();
dashboardRoutes.use(authenticate);

dashboardRoutes.get('/', async (req, res) => {
  const unitWhere = await scopedUnitWhere(req.user);
  const unitIds = await scopedUnitIds(req.user);
  const unitFilter = unitIds ? { unitId: { in: unitIds } } : {};

  const announcementVisibility = [
    { targetAudience: 'all' },
    ...(req.user.role === 'supervisor' ? [{ targetAudience: 'supervisors' }] : []),
    ...(unitIds ? [{ targetUnits: { some: { unitId: { in: unitIds } } } }] : [])
  ];

  const [
    totalUnits,
    unitsByStatus,
    openTickets,
    ticketsByPriority,
    totalEvaluations,
    inValidation,
    openActionPlans,
    unreadAnnouncements,
    activeOnboardings,
    globalFiles
  ] = await Promise.all([
    prisma.unit.count({ where: unitWhere }),
    prisma.unit.groupBy({ by: ['status'], where: unitWhere, _count: true }),
    prisma.ticket.count({ where: { ...unitFilter, status: { in: ['open', 'in_progress'] } } }),
    prisma.ticket.groupBy({ by: ['priority'], where: unitFilter, _count: true }),
    prisma.checklistExecution.count({ where: unitFilter }),
    prisma.checklistExecution.count({ where: { ...unitFilter, status: 'validation' } }),
    prisma.projectTask.count({ where: { status: { in: ['todo', 'doing'] } } }),
    prisma.announcement.count({
      where: {
        readReceipts: { none: { userId: req.user.id } },
        OR: announcementVisibility
      }
    }),
    prisma.onboardingPlan.count({ where: { ...unitFilter, status: { in: ['pending', 'in_progress'] } } }),
    prisma.driveFile.count({ where: unitIds ? { OR: [{ unitId: null }, { unitId: { in: unitIds } }] } : {} })
  ]);

  res.json({
    units: { total: totalUnits, byStatus: unitsByStatus },
    tickets: { open: openTickets, byPriority: ticketsByPriority },
    checklist: { totalEvaluations, inValidation, actionPlans: openActionPlans },
    announcements: { unread: unreadAnnouncements },
    onboarding: { active: activeOnboardings },
    drive: { files: globalFiles }
  });
});
