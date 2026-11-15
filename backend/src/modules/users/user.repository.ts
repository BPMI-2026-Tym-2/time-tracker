import { prisma } from '../../db/prisma.js';
import { publicUserSelect } from './user.schemas.js';
import type { UserRecord } from './user.types.js';

const CREDENTIAL_PROVIDER_ID = 'credential';

export function findUserByEmail(email: string): Promise<UserRecord | null> {
  return prisma.user.findUnique({
    where: { email },
    select: publicUserSelect,
  });
}

export function findUserById(id: string): Promise<UserRecord | null> {
  return prisma.user.findUnique({
    where: { id },
    select: publicUserSelect,
  });
}

export async function hasCredentialAccount(userId: string): Promise<boolean> {
  const account = await prisma.account.findFirst({
    where: { userId, providerId: CREDENTIAL_PROVIDER_ID },
    select: { id: true },
  });

  return account !== null;
}
