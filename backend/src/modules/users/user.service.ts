import type { UserProfile } from '@time-tracker/shared';
import { AppError } from '../../shared/errors/app-error.js';
import userMapper from './user.mapper.js';
import userRepository from './user.repository.js';

export async function getOwnProfile(userId: string): Promise<UserProfile> {
  const [user, hasPassword] = await Promise.all([
    userRepository.findUserById(userId),
    userRepository.hasCredentialAccount(userId),
  ]);

  if (!user) {
    throw new AppError('Údaje profilu se nepodařilo načíst.', 404);
  }

  return userMapper.toUserProfile(user, hasPassword);
}

const userService = {
  getOwnProfile,
};

export default userService;
