import { randomUUID } from 'node:crypto';

import { User } from '../../../users/domain/entities/user.entity.js';
import { Email } from '../../../users/domain/value-objects/email.vo.js';
import { Username } from '../../../users/domain/value-objects/username.vo.js';
import { UserEmailAlreadyExistsError } from '../../../users/domain/exceptions/user-email-already-exists.error.js';
import { UsernameAlreadyExistsError } from '../../../users/domain/exceptions/username-already-exists.error.js';

import { UserCredential } from '../../domain/entities/user-credential.entity.js';
import { InvalidPasswordError } from '../../domain/exceptions/invalid-password.error.js';

import type { AuthAccountRepository } from '../../domain/repositories/auth-account.repository.js';
import type { PasswordHasher } from '../../domain/services/password-hasher.js';

import type { RegisterUserInput } from '../types/register-user.types.js';

export class RegisterUserUseCase {
  constructor(
    private readonly authAccountRepository: AuthAccountRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: RegisterUserInput): Promise<User> {
    const email = Email.create(input.email);
    const username = Username.create(input.username);

    if (input.password.length < 8) {
      throw new InvalidPasswordError();
    }

    const existingEmail = await this.authAccountRepository.findByEmail(email);

    if (existingEmail) {
      throw new UserEmailAlreadyExistsError();
    }

    const existingUsername =
      await this.authAccountRepository.findByUsername(username);

    if (existingUsername) {
      throw new UsernameAlreadyExistsError();
    }

    const passwordHash = await this.passwordHasher.hash(input.password);

    const user = User.create({
      id: randomUUID(),
      email,
      username,
      displayName: input.displayName,
      bio: input.bio,
      avatarUrl: input.avatarUrl,
    });

    const credential = UserCredential.create({
      id: randomUUID(),
      userId: user.id,
      passwordHash,
    });

    await this.authAccountRepository.createAccount(user, credential);

    return user;
  }
}
