import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RegisterUserUseCase } from '../register-user.use-case.js';

import type { AuthAccountRepository } from '../../../domain/repositories/auth-account.repository.js';
import type { PasswordHasher } from '../../../domain/services/password-hasher.js';
import type { RegisterUserInput } from '../../types/register-user.types.js';

import { InvalidPasswordError } from '../../../domain/exceptions/invalid-password.error.js';

import { InvalidEmailError } from '../../../../users/domain/exceptions/invalid-email.error.js';
import { InvalidUsernameError } from '../../../../users/domain/exceptions/invalid-username.error.js';
import { UserEmailAlreadyExistsError } from '../../../../users/domain/exceptions/user-email-already-exists.error.js';
import { UsernameAlreadyExistsError } from '../../../../users/domain/exceptions/username-already-exists.error.js';

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;

  const authAccountRepository: AuthAccountRepository = {
    createAccount: vi.fn(),
    findByEmail: vi.fn(),
    findByUsername: vi.fn(),
  };

  const passwordHasher: PasswordHasher = {
    hash: vi.fn(),
    verify: vi.fn(),
  };

  const validInput: RegisterUserInput = {
    email: 'andre@example.com',
    username: 'andregonzaga',
    displayName: 'Andre Gonzaga',
    password: 'StrongPass123',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(authAccountRepository.findByEmail).mockResolvedValue(null);

    vi.mocked(authAccountRepository.findByUsername).mockResolvedValue(null);

    vi.mocked(authAccountRepository.createAccount).mockResolvedValue(undefined);

    vi.mocked(passwordHasher.hash).mockResolvedValue('hashed-password');

    useCase = new RegisterUserUseCase(authAccountRepository, passwordHasher);
  });

  it('should register a user successfully', async () => {
    const user = await useCase.execute(validInput);

    expect(user.email.value).toBe(validInput.email);
    expect(user.username.value).toBe(validInput.username);

    expect(passwordHasher.hash).toHaveBeenCalledWith(validInput.password);

    expect(authAccountRepository.createAccount).toHaveBeenCalledOnce();
  });

  it('should reject an invalid email', async () => {
    await expect(
      useCase.execute({
        ...validInput,
        email: 'invalid-email',
      }),
    ).rejects.toThrow(InvalidEmailError);

    expect(passwordHasher.hash).not.toHaveBeenCalled();
  });

  it('should reject an invalid username', async () => {
    await expect(
      useCase.execute({
        ...validInput,
        username: 'invalid username!',
      }),
    ).rejects.toThrow(InvalidUsernameError);

    expect(passwordHasher.hash).not.toHaveBeenCalled();
  });

  it('should reject a password shorter than eight characters', async () => {
    await expect(
      useCase.execute({
        ...validInput,
        password: '1234567',
      }),
    ).rejects.toThrow(InvalidPasswordError);

    expect(passwordHasher.hash).not.toHaveBeenCalled();
  });

  it('should reject an existing email', async () => {
    vi.mocked(authAccountRepository.findByEmail).mockResolvedValue({
      user: {} as never,
      credential: {} as never,
    });

    await expect(useCase.execute(validInput)).rejects.toThrow(
      UserEmailAlreadyExistsError,
    );

    expect(passwordHasher.hash).not.toHaveBeenCalled();
  });

  it('should reject an existing username', async () => {
    vi.mocked(authAccountRepository.findByUsername).mockResolvedValue({
      user: {} as never,
      credential: {} as never,
    });

    await expect(useCase.execute(validInput)).rejects.toThrow(
      UsernameAlreadyExistsError,
    );

    expect(passwordHasher.hash).not.toHaveBeenCalled();
  });

  it('should propagate password hashing errors', async () => {
    vi.mocked(passwordHasher.hash).mockRejectedValue(
      new Error('Hashing failed'),
    );

    await expect(useCase.execute(validInput)).rejects.toThrow('Hashing failed');

    expect(authAccountRepository.createAccount).not.toHaveBeenCalled();
  });

  it('should propagate account persistence errors', async () => {
    vi.mocked(authAccountRepository.createAccount).mockRejectedValue(
      new Error('Persistence failed'),
    );

    await expect(useCase.execute(validInput)).rejects.toThrow(
      'Persistence failed',
    );
  });
});
