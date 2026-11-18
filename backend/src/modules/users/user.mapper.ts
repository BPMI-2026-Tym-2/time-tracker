import type { PublicUser, UserProfile } from '@time-tracker/shared';
import type { UserRecord } from './user.types.js';

export function toPublicUser(user: UserRecord): PublicUser {
  return {
    id: user.id,
    name: user.name,
    surname: user.surname,
    email: user.email,
    profileImageUrl: user.image,
    createdAt: user.createdAt,
  };
}

export function toUserProfile(user: UserRecord, hasPassword: boolean): UserProfile {
  return {
    ...toPublicUser(user),
    hasPassword,
  };
}

const userMapper = {
  toPublicUser,
  toUserProfile,
};

export default userMapper;
