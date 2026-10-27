import { TaskSchema } from '@time-tracker/shared';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import express from 'express';

const app = express();
const prisma = new PrismaClient();
app.use(express.json());
const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:3000';
app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', corsOrigin);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (_req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

app.get('/api/tasks', async (_req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return res.json(tasks);
  } catch (error) {
    console.error('Failed to load tasks', error);
    return res.status(500).json({ error: 'Failed to load tasks' });
  }
});

app.post('/api/tasks', async (req, res) => {
  // Validace při vytváření nového tasku (ignoruje ID a createdAt)
  const CreateTaskSchema = TaskSchema.omit({ id: true, createdAt: true });

  const parsed = CreateTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(parsed.error);
  }

  try {
    const task = await prisma.task.create({
      data: parsed.data,
    });

    return res.status(201).json(task);
  } catch (error) {
    console.error('Failed to create task', error);
    return res.status(500).json({ error: 'Failed to create task' });
  }
});

const port = Number(process.env.PORT ?? 3001);

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
