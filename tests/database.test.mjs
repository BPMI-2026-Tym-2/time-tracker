import assert from 'node:assert/strict';
import test from 'node:test';
import { PrismaClient } from '@prisma/client';
import { TaskSchema } from '@time-tracker/shared';

test('Prisma can transact against MongoDB and return a valid shared Task', async () => {
  const prisma = new PrismaClient({
    datasourceUrl:
      process.env.TEST_DATABASE_URL ??
      'mongodb://127.0.0.1:27017/time_tracker?replicaSet=rs0&directConnection=true',
  });

  try {
    // Failure rolls back the transaction; success deletes the temporary record.
    await prisma.$transaction(async (tx) => {
      const task = await tx.task.create({ data: { title: 'Database setup check' } });
      const stored = await tx.task.findUniqueOrThrow({ where: { id: task.id } });

      assert.equal(stored.title, 'Database setup check');
      assert.equal(TaskSchema.parse(stored).id, task.id);

      await tx.task.delete({ where: { id: task.id } });
      assert.equal(await tx.task.findUnique({ where: { id: task.id } }), null);
    });
  } finally {
    await prisma.$disconnect();
  }
});
