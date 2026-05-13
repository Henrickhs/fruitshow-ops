import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, requireRoles } from '../middleware/auth.js';
import { getPagination, paginated } from '../utils/pagination.js';
import { assertUnitAccess, scopedUnitIds } from '../utils/access.js';

export const checklistRoutes = Router();
checklistRoutes.use(authenticate);

function calculateScore(questions, answers) {
  const byQuestion = new Map(answers.map((answer) => [answer.questionId, answer]));
  let max = 0;
  let achieved = 0;
  for (const question of questions) {
    if (question.type === 'photo' || question.type === 'text') continue;
    max += question.weight;
    const answer = byQuestion.get(question.id);
    if (!answer) continue;
    if (question.type === 'yes_no' && answer.value === 'sim') achieved += question.weight;
    else if (answer.score != null) achieved += Number(answer.score);
  }
  return max ? Math.round((achieved / max) * 100) : 0;
}

checklistRoutes.get('/questionnaires', async (_req, res) => {
  const data = await prisma.questionnaire.findMany({ include: { questions: { orderBy: { order: 'asc' } } }, orderBy: { createdAt: 'desc' } });
  res.json(data);
});

checklistRoutes.post('/questionnaires', requireRoles('admin', 'supervisor'), async (req, res) => {
  const questionnaire = await prisma.questionnaire.create({
    data: {
      title: req.body.title,
      category: req.body.category,
      questions: {
        create: (req.body.questions || []).map((question, index) => ({
          title: question.title,
          type: question.type,
          required: question.required ?? true,
          weight: question.weight || 1,
          options: question.options || [],
          order: question.order ?? index
        }))
      }
    },
    include: { questions: true }
  });
  res.status(201).json(questionnaire);
});

checklistRoutes.get('/executions', async (req, res) => {
  const { page, pageSize, skip, take } = getPagination(req.query);
  const unitIds = await scopedUnitIds(req.user);
  const where = {
    ...(unitIds ? { unitId: { in: unitIds } } : {}),
    ...(req.query.unitId ? { unitId: req.query.unitId } : {}),
    ...(req.query.status ? { status: req.query.status } : {})
  };
  const [data, total] = await Promise.all([
    prisma.checklistExecution.findMany({
      where,
      include: { unit: true, questionnaire: true, executedBy: { select: { id: true, name: true } } },
      skip,
      take,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.checklistExecution.count({ where })
  ]);
  res.json(paginated(data, total, page, pageSize));
});

checklistRoutes.post('/executions', async (req, res) => {
  await assertUnitAccess(req.user, req.body.unitId);
  const execution = await prisma.checklistExecution.create({
    data: {
      unitId: req.body.unitId,
      questionnaireId: req.body.questionnaireId,
      executedById: req.user.id,
      status: 'in_progress'
    },
    include: { questionnaire: { include: { questions: true } }, answers: true }
  });
  res.status(201).json(execution);
});

checklistRoutes.get('/executions/:id', async (req, res) => {
  const unitIds = await scopedUnitIds(req.user);
  const execution = await prisma.checklistExecution.findFirst({
    where: { id: req.params.id, ...(unitIds ? { unitId: { in: unitIds } } : {}) },
    include: { unit: true, questionnaire: { include: { questions: { orderBy: { order: 'asc' } } } }, answers: true }
  });
  if (!execution) return res.status(404).json({ message: 'Checklist não encontrado.' });
  res.json(execution);
});

checklistRoutes.put('/executions/:id/answers', async (req, res) => {
  const execution = await prisma.checklistExecution.findUnique({
    where: { id: req.params.id },
    include: { questionnaire: { include: { questions: true } } }
  });
  if (!execution) return res.status(404).json({ message: 'Checklist não encontrado.' });
  await assertUnitAccess(req.user, execution.unitId);

  await prisma.answer.deleteMany({ where: { executionId: execution.id } });
  const answers = await prisma.answer.createMany({
    data: (req.body.answers || []).map((answer) => ({
      executionId: execution.id,
      questionId: answer.questionId,
      value: answer.value,
      photoPath: answer.photoPath,
      score: answer.score
    }))
  });
  const savedAnswers = await prisma.answer.findMany({ where: { executionId: execution.id } });
  const scorePercentage = calculateScore(execution.questionnaire.questions, savedAnswers);
  const updated = await prisma.checklistExecution.update({
    where: { id: execution.id },
    data: { scorePercentage, status: req.body.submit ? 'validation' : 'in_progress' },
    include: { answers: true, questionnaire: true, unit: true }
  });
  res.json({ ...updated, saved: answers.count });
});

checklistRoutes.patch('/executions/:id/status', requireRoles('admin', 'supervisor'), async (req, res) => {
  const execution = await prisma.checklistExecution.update({ where: { id: req.params.id }, data: { status: req.body.status } });
  res.json(execution);
});
