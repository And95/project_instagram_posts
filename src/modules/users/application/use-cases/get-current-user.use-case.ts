import { User } from '../../domain/entities/user.entity.js';
import { UserNotFoundError } from '../../domain/exceptions/user-not-found.error.js';
import type { UserRepository } from '../../domain/repositories/user.repository.js';

import type { GetCurrentUserInput } from '../types/get-current-user.input.js';

export class GetCurrentUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: GetCurrentUserInput): Promise<User> {
    const user = await this.userRepository.findById(input.userId);

    if (!user) {
      throw new UserNotFoundError();
    }

    return user;
  }
}
