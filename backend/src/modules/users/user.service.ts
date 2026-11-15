import type { UserProfile } from '@time-tracker/shared';
import { AppError } from '../../shared/errors/app-error.js';
import { toUserProfile } from './user.mapper.js';
import { findUserById, hasCredentialAccount } from './user.repository.js';

async function getOwnProfile(userId: string): Promise<UserProfile> {
  const [user, hasPassword] = await Promise.all([
    findUserById(userId),
    hasCredentialAccount(userId),
  ]);

  if (!user) {
    throw new AppError('Údaje profilu se nepodařilo načíst.', 404);
  }

  return toUserProfile(user, hasPassword);
}

const userService = {
  getOwnProfile,
};

export default userService;
