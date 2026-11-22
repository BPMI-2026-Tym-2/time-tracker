import { prisma } from '../../db/prisma.js';
import { publicUserSelect } from './user.schemas.js';
import type { UserRecord } from './user.types.js';

export type UserDeletionAuthorization = (user: { id: string } | null) => void | Promise<void>;

export type UserRepository = {
  deleteUser: (userId: string, authorize: UserDeletionAuthorization) => Promise<void>;
  findUserByEmail: (email: string) => Promise<UserRecord | null>;
  findUserById: (id: string) => Promise<UserRecord | null>;
  hasCredentialAccount: (userId: string) => Promise<boolean>;
};

const CREDENTIAL_PROVIDER_ID = 'credential';

function findUserByEmail(email: string): Promise<UserRecord | null> {
  return prisma.user.findUnique({
    where: { email },
    select: publicUserSelect,
  });
}

function findUserById(id: string): Promise<UserRecord | null> {
  return prisma.user.findUnique({
    where: { id },
    select: publicUserSelect,
  });
}

async function hasCredentialAccount(userId: string): Promise<boolean> {
  const account = await prisma.account.findFirst({
    where: { userId, providerId: CREDENTIAL_PROVIDER_ID },
    select: { id: true },
  });

  return account !== null;
}

// smaže uživatele, jeho session, účty, členství, odeslané pozvánky
// + skupiny (organizace), které založil (role "owner"), včetně jejich členů a pozvánek.
async function deleteUser(userId: string, authorize: UserDeletionAuthorization): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: userId }, select: { id: true } });

    await authorize(user);

    const ownedMemberships = await tx.member.findMany({
      where: { userId, role: 'owner' },
      select: { organizationId: true },
    });
    const ownedOrganizationIds = ownedMemberships.map((member) => member.organizationId);

    await tx.invitation.deleteMany({
      where: { OR: [{ inviterId: userId }, { organizationId: { in: ownedOrganizationIds } }] },
    });
    await tx.member.deleteMany({
      where: { OR: [{ userId }, { organizationId: { in: ownedOrganizationIds } }] },
    });
    await tx.organization.deleteMany({ where: { id: { in: ownedOrganizationIds } } });
    await tx.session.deleteMany({ where: { userId } });
    if (ownedOrganizationIds.length > 0) {
      await tx.session.updateMany({
        where: { activeOrganizationId: { in: ownedOrganizationIds } },
        data: { activeOrganizationId: null },
      });
    }
    await tx.account.deleteMany({ where: { userId } });
    await tx.user.delete({ where: { id: userId } });
  });
}

const userRepository: UserRepository = {
  deleteUser,
  findUserByEmail,
  findUserById,
  hasCredentialAccount,
};

export default userRepository;
