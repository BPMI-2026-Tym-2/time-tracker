import type { DeleteUserResponse } from '@time-tracker/shared';
import type { RequestingUser } from '../../shared/auth/types.js';
import { AppError } from '../../shared/errors/app-error.js';
import userRepository from './user.repository.js';

export type UserService = {
  deleteUser: (requestingUser: RequestingUser, userId: string) => Promise<DeleteUserResponse>;
};

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

  return { message: 'Účet byl odstraněn.' };
}

const userService: UserService = {
  deleteUser,
};

export default userService;
