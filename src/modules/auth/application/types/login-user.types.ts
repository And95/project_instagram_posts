import type { User } from '../../../users/domain/entities/user.entity.js';

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface LoginUserResult {
  accessToken: string;
  user: User;
}
