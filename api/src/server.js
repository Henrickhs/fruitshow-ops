import 'dotenv/config';
import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import { authRoutes } from './routes/auth.js';
import { userRoutes } from './routes/users.js';
import { dashboardRoutes } from './routes/dashboard.js';
import { unitRoutes } from './routes/units.js';
import { checklistRoutes } from './routes/checklist.js';
import { ticketRoutes } from './routes/tickets.js';
import { announcementRoutes } from './routes/announcements.js';
import { projectRoutes } from './routes/projects.js';
import { onboardingRoutes } from './routes/onboarding.js';
import { driveRoutes } from './routes/drive.js';
import { errorHandler, notFound } from './middleware/error.js';

const app = express();

app.use(cors({ origin: process.env.WEB_ORIGIN || true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'FruitShow Ops API' }));
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/units', unitRoutes);
app.use('/checklist', checklistRoutes);
app.use('/tickets', ticketRoutes);
app.use('/announcements', announcementRoutes);
app.use('/projects', projectRoutes);
app.use('/onboarding', onboardingRoutes);
app.use('/drive', driveRoutes);
app.use(notFound);
app.use(errorHandler);

const port = Number(process.env.PORT || 3333);
app.listen(port, () => console.log(`FruitShow Ops API ouvindo na porta ${port}`));
