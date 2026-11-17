import { Email } from '../../../users/domain/value-objects/email.vo.js';

import { InvalidCredentialsError } from '../../domain/exceptions/invalid-credentials.error.js';

import type { AuthAccountRepository } from '../../domain/repositories/auth-account.repository.js';
import type { PasswordHasher } from '../../domain/services/password-hasher.js';
import type { TokenGenerator } from '../../domain/services/token-generator.js';

import type {
  LoginUserInput,
  LoginUserResult,
} from '../types/login-user.types.js';

export class LoginUserUseCase {
  constructor(
    private readonly authAccountRepository: AuthAccountRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenGenerator: TokenGenerator,
  ) {}

  async execute(input: LoginUserInput): Promise<LoginUserResult> {
    const email = Email.create(input.email);

    const account = await this.authAccountRepository.findByEmail(email);

    if (!account) {
      throw new InvalidCredentialsError();
    }

    const isPasswordValid = await this.passwordHasher.verify(
      input.password,
      account.credential.passwordHash,
    );

    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    const accessToken = await this.tokenGenerator.generate({
      sub: account.user.id,
      email: account.user.email.value,
    });

    return {
      accessToken,
      user: account.user,
    };
  }
}
