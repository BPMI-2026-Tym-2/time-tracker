import { AppError } from '../../shared/errors/app-error.js';
import { findUserById, type PublicUser } from './user.repository.js';

export async function getUserById(id: string): Promise<PublicUser> {
  const user = await findUserById(id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
}
