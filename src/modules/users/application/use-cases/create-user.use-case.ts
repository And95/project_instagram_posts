import { randomUUID } from 'node:crypto';

import { User } from '../../domain/entities/user.entity.js';
import { UserEmailAlreadyExistsError } from '../../domain/exceptions/user-email-already-exists.error.js';
import { UsernameAlreadyExistsError } from '../../domain/exceptions/username-already-exists.error.js';
import { Email } from '../../domain/value-objects/email.vo.js';
import { Username } from '../../domain/value-objects/username.vo.js';
import type { UserRepository } from '../../domain/repositories/user.repository.js';

import type { CreateUserInput } from '../types/create-user.input.js';

export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: CreateUserInput): Promise<User> {
    const email = Email.create(input.email);
    const username = Username.create(input.username);

    const existingEmail = await this.userRepository.findByEmail(email);

    if (existingEmail) {
      throw new UserEmailAlreadyExistsError();
    }

    const existingUsername = await this.userRepository.findByUsername(username);

    if (existingUsername) {
      throw new UsernameAlreadyExistsError();
    }

    const user = User.create({
      id: randomUUID(),
      email,
      username,
      displayName: input.displayName,
      bio: input.bio,
      avatarUrl: input.avatarUrl,
    });

    await this.userRepository.save(user);

    return user;
  }
}
