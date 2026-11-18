import type { DeleteUserResponse, UserProfile } from '@time-tracker/shared';
import type { RequestingUser } from '../../shared/auth/types.js';
import { AppError } from '../../shared/errors/app-error.js';
import userMapper from './user.mapper.js';
import userRepository from './user.repository.js';

export type UserService = {
  getOwnProfile: (userId: string) => Promise<UserProfile>;
  deleteUser: (requestingUser: RequestingUser, userId: string) => Promise<DeleteUserResponse>;
};

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

// odstranit muze sam uživatel, cizí účet jen super admin
async function deleteUser(
  requestingUser: RequestingUser,
  userId: string,
): Promise<DeleteUserResponse> {
  if (requestingUser.id !== userId && !requestingUser.roles.includes('admin')) {
    throw new AppError('Účet může odstranit pouze jeho vlastník', 403);
  }

  try {
    await userRepository.deleteUser(userId, (user) => {
      if (!user) {
        throw new AppError('User not found', 404);
      }
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('User deletion failed', error);
    throw new AppError('Odstranění účtu se nezdařilo. Zkuste to prosím znovu', 500);
  }

  return {
    message: requestingUser.id === userId ? 'Váš účet byl odstraněn' : 'Účet byl odstraněn.',
  };
}

const userService: UserService = {
  getOwnProfile,
  deleteUser,
};

export default userService;
