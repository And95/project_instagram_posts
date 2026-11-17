import { randomUUID } from 'node:crypto';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { User } from '../../../../users/domain/entities/user.entity.js';
import { Email } from '../../../../users/domain/value-objects/email.vo.js';
import { Username } from '../../../../users/domain/value-objects/username.vo.js';

import { InvalidEmailError } from '../../../../users/domain/exceptions/invalid-email.error.js';

import { UserCredential } from '../../../domain/entities/user-credential.entity.js';
import { InvalidCredentialsError } from '../../../domain/exceptions/invalid-credentials.error.js';

import type {
  AuthAccount,
  AuthAccountRepository,
} from '../../../domain/repositories/auth-account.repository.js';

import type { PasswordHasher } from '../../../domain/services/password-hasher.js';
import type { TokenGenerator } from '../../../domain/services/token-generator.js';

import { LoginUserUseCase } from '../login.use-case.js';

describe('LoginUserUseCase', () => {
  const findByEmail = vi.fn<AuthAccountRepository['findByEmail']>();

  const findByUsername = vi.fn<AuthAccountRepository['findByUsername']>();

  const createAccount = vi.fn<AuthAccountRepository['createAccount']>();

  const verify = vi.fn<PasswordHasher['verify']>();
  const hash = vi.fn<PasswordHasher['hash']>();

  const generate = vi.fn<TokenGenerator['generate']>();

  const authAccountRepository: AuthAccountRepository = {
    findByEmail,
    findByUsername,
    createAccount,
  };

  const passwordHasher: PasswordHasher = {
    hash,
    verify,
  };

  const tokenGenerator: TokenGenerator = {
    generate,
  };

  let useCase: LoginUserUseCase;

  function createAccountFixture(): AuthAccount {
    const user = User.create({
      id: randomUUID(),
      email: Email.create('andre@example.com'),
      username: Username.create(
        `user${randomUUID().replaceAll('-', '').slice(0, 12)}`,
      ),
      displayName: 'Integration Test User',
    });

    const credential = UserCredential.create({
      id: randomUUID(),
      userId: user.id,
      passwordHash: 'hashed-password',
    });

    return { user, credential };
  }

  beforeEach(() => {
    vi.clearAllMocks();

    findByEmail.mockResolvedValue(null);
    findByUsername.mockResolvedValue(null);
    createAccount.mockResolvedValue(undefined);

    verify.mockResolvedValue(true);
    hash.mockResolvedValue('hashed-password');

    generate.mockResolvedValue('generated-jwt-token');

    useCase = new LoginUserUseCase(
      authAccountRepository,
      passwordHasher,
      tokenGenerator,
    );
  });

  it('should authenticate a user and generate an access token', async () => {
    const account = createAccountFixture();

    findByEmail.mockResolvedValue(account);

    const result = await useCase.execute({
      email: 'ANDRE@example.com',
      password: 'correct-password',
    });

    expect(result.accessToken).toBe('generated-jwt-token');
    expect(result.user).toBe(account.user);

    expect(findByEmail).toHaveBeenCalledWith(Email.create('andre@example.com'));

    expect(verify).toHaveBeenCalledWith(
      'correct-password',
      account.credential.passwordHash,
    );

    expect(generate).toHaveBeenCalledWith({
      sub: account.user.id,
      email: account.user.email.value,
    });
  });

  it('should reject an invalid email', async () => {
    await expect(
      useCase.execute({
        email: 'invalid-email',
        password: 'correct-password',
      }),
    ).rejects.toBeInstanceOf(InvalidEmailError);

    expect(findByEmail).not.toHaveBeenCalled();
    expect(verify).not.toHaveBeenCalled();
    expect(generate).not.toHaveBeenCalled();
  });

  it('should reject when the account does not exist', async () => {
    await expect(
      useCase.execute({
        email: 'andre@example.com',
        password: 'correct-password',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);

    expect(verify).not.toHaveBeenCalled();
    expect(generate).not.toHaveBeenCalled();
  });

  it('should reject when the password is incorrect', async () => {
    const account = createAccountFixture();

    findByEmail.mockResolvedValue(account);
    verify.mockResolvedValue(false);

    await expect(
      useCase.execute({
        email: 'andre@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);

    expect(generate).not.toHaveBeenCalled();
  });

  it('should propagate password verification errors', async () => {
    const account = createAccountFixture();
    const error = new Error('Password verification failed');

    findByEmail.mockResolvedValue(account);
    verify.mockRejectedValue(error);

    await expect(
      useCase.execute({
        email: 'andre@example.com',
        password: 'correct-password',
      }),
    ).rejects.toThrow(error);

    expect(generate).not.toHaveBeenCalled();
  });

  it('should propagate token generation errors', async () => {
    const account = createAccountFixture();
    const error = new Error('Token generation failed');

    findByEmail.mockResolvedValue(account);
    generate.mockRejectedValue(error);

    await expect(
      useCase.execute({
        email: 'andre@example.com',
        password: 'correct-password',
      }),
    ).rejects.toThrow(error);
  });
});
