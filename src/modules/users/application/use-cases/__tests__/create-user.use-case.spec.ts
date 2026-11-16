import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CreateUserUseCase } from '../create-user.use-case.js';

import { User } from '../../../domain/entities/user.entity.js';
import { UserEmailAlreadyExistsError } from '../../../domain/exceptions/user-email-already-exists.error.js';
import { UsernameAlreadyExistsError } from '../../../domain/exceptions/username-already-exists.error.js';

import type { UserRepository } from '../../../domain/repositories/user.repository.js';

import { Email } from '../../../domain/value-objects/email.vo.js';
import { Username } from '../../../domain/value-objects/username.vo.js';

describe('CreateUserUseCase', () => {
  let userRepository: UserRepository;
  let createUserUseCase: CreateUserUseCase;

  beforeEach(() => {
    userRepository = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      findByUsername: vi.fn(),
      save: vi.fn(),
    };

    createUserUseCase = new CreateUserUseCase(userRepository);

    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
    vi.mocked(userRepository.findByUsername).mockResolvedValue(null);
    vi.mocked(userRepository.save).mockResolvedValue(undefined);
  });

  const input = {
    email: 'andre@example.com',
    username: 'andre_gonzaga',
    displayName: 'André Gonzaga',
  };

  describe('execute', () => {
    it('should create and persist a user', async () => {
      const user = await createUserUseCase.execute(input);

      expect(user).toBeInstanceOf(User);
      expect(user.id).toBeTruthy();
      expect(user.email.value).toBe('andre@example.com');
      expect(user.username.value).toBe('andre_gonzaga');
      expect(user.displayName).toBe('André Gonzaga');

      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        Email.create(input.email),
      );

      expect(userRepository.findByUsername).toHaveBeenCalledWith(
        Username.create(input.username),
      );

      expect(userRepository.save).toHaveBeenCalledWith(user);
    });

    it('should reject an existing email', async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(
        User.create({
          id: 'existing-user',
          email: Email.create(input.email),
          username: Username.create('existing_user'),
          displayName: 'Existing User',
        }),
      );

      await expect(createUserUseCase.execute(input)).rejects.toThrow(
        UserEmailAlreadyExistsError,
      );

      expect(userRepository.save).not.toHaveBeenCalled();
      expect(userRepository.findByUsername).not.toHaveBeenCalled();
    });

    it('should reject an existing username', async () => {
      vi.mocked(userRepository.findByUsername).mockResolvedValue(
        User.create({
          id: 'existing-user',
          email: Email.create('existing@example.com'),
          username: Username.create(input.username),
          displayName: 'Existing User',
        }),
      );

      await expect(createUserUseCase.execute(input)).rejects.toThrow(
        UsernameAlreadyExistsError,
      );

      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should reject an invalid email', async () => {
      await expect(
        createUserUseCase.execute({
          ...input,
          email: 'invalid-email',
        }),
      ).rejects.toThrow();

      expect(userRepository.findByEmail).not.toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should reject an invalid username', async () => {
      await expect(
        createUserUseCase.execute({
          ...input,
          username: 'invalid username',
        }),
      ).rejects.toThrow();

      expect(userRepository.findByEmail).not.toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should propagate repository persistence errors', async () => {
      vi.mocked(userRepository.save).mockRejectedValue(
        new Error('Database error'),
      );

      await expect(createUserUseCase.execute(input)).rejects.toThrow(
        'Database error',
      );
    });
  });
});
