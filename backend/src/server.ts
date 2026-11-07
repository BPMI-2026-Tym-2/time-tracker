import net from 'node:net';
import { app } from './app.js';
import { env } from './config/env.js';
import { prisma } from './db/prisma.js';

function isPortListening(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(600);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      resolve(false);
    });
    socket.connect(port, '127.0.0.1');
  });
}

async function startServer() {
  const isDbUp = await isPortListening(27017);

  if (!isDbUp && process.env.NODE_ENV !== 'production') {
    try {
      const { MongoMemoryReplSet } = await import('mongodb-memory-server');
      console.log(
        'MongoDB neběží – spouštím vestavěnou in-memory replica set (rs0) na portu 27017...',
      );
      await MongoMemoryReplSet.create({
        replSet: { name: 'rs0', count: 1, storageEngine: 'wiredTiger' },
        instanceOpts: [{ port: 27017 }],
      });
      console.log('In-memory MongoDB replica set spuštěna na mongodb://127.0.0.1:27017');
    } catch (err) {
      console.warn(
        'Nepodařilo se spustit in-memory MongoDB:',
        err instanceof Error ? err.message : err,
      );
    }
  }

  // Příprava výchozích dat v databázi pro zkoušení use casu v prohlížeči
  try {
    const defaultUserId = 'user-jan-id';
    const defaultGroupId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

    await prisma.user.upsert({
      where: { id: defaultUserId },
      update: {},
      create: {
        id: defaultUserId,
        name: 'Jan',
        surname: 'Gergel',
        email: 'jan.gergel@unicorn.cz',
        role: 'user',
      },
    });

    await prisma.group.upsert({
      where: { id: defaultGroupId },
      update: {},
      create: {
        id: defaultGroupId,
        name: 'Skupina 1',
        description: 'Sdílený prostor pro plánování aktivit, záznamy a spolupráci členů skupiny.',
        category: 'Obecná',
        color: 'blue-sky',
        logo: 'users',
        visibility: 'private',
        invitationCode: 'A7F3D9',
      },
    });

    await prisma.groupMember.upsert({
      where: {
        groupId_userId: {
          groupId: defaultGroupId,
          userId: defaultUserId,
        },
      },
      update: { role: 'owner' },
      create: {
        groupId: defaultGroupId,
        userId: defaultUserId,
        role: 'owner',
      },
    });

    // Přidání dalších členů do přehledu podle wireframu
    const annaId = 'user-anna-id';
    const martinId = 'user-martin-id';

    await prisma.user.upsert({
      where: { id: annaId },
      update: {},
      create: {
        id: annaId,
        name: 'Anna',
        surname: 'Nováková',
        email: 'anna.novakova@unicorn.cz',
        role: 'user',
      },
    });

    await prisma.groupMember.upsert({
      where: {
        groupId_userId: {
          groupId: defaultGroupId,
          userId: annaId,
        },
      },
      update: { role: 'admin' },
      create: {
        groupId: defaultGroupId,
        userId: annaId,
        role: 'admin',
      },
    });

    await prisma.user.upsert({
      where: { id: martinId },
      update: {},
      create: {
        id: martinId,
        name: 'Martin',
        surname: 'Kříž',
        email: 'martin.kriz@unicorn.cz',
        role: 'user',
      },
    });

    await prisma.groupMember.upsert({
      where: {
        groupId_userId: {
          groupId: defaultGroupId,
          userId: martinId,
        },
      },
      update: {},
      create: {
        groupId: defaultGroupId,
        userId: martinId,
        role: 'member',
      },
    });

    console.log('Výchozí data pro skupinu a uživatele byla připravena.');
  } catch (err) {
    console.warn('Varování při seedování dat:', err instanceof Error ? err.message : err);
  }

  app.listen(env.port, () => {
    console.log(`Backend běží na http://localhost:${env.port}`);
  });
}

void startServer();
