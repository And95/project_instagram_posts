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

  let findByEmail: ReturnType<typeof vi.fn<UserRepository['findByEmail']>>;
  let findByUsername: ReturnType<
    typeof vi.fn<UserRepository['findByUsername']>
  >;
  let save: ReturnType<typeof vi.fn<UserRepository['save']>>;

  beforeEach(() => {
    findByEmail = vi.fn<UserRepository['findByEmail']>();
    findByUsername = vi.fn<UserRepository['findByUsername']>();
    save = vi.fn<UserRepository['save']>();

    userRepository = {
      findById: vi.fn<UserRepository['findById']>(),
      findByEmail,
      findByUsername,
      save,
    };

    createUserUseCase = new CreateUserUseCase(userRepository);

    findByEmail.mockResolvedValue(null);
    findByUsername.mockResolvedValue(null);
    save.mockResolvedValue(undefined);
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

      expect(findByEmail).toHaveBeenCalledWith(Email.create(input.email));

      expect(findByUsername).toHaveBeenCalledWith(
        Username.create(input.username),
      );

      expect(save).toHaveBeenCalledWith(user);
    });

    it('should reject an existing email', async () => {
      findByEmail.mockResolvedValue(
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

      expect(save).not.toHaveBeenCalled();
      expect(findByUsername).not.toHaveBeenCalled();
    });

    it('should reject an existing username', async () => {
      findByUsername.mockResolvedValue(
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

      expect(save).not.toHaveBeenCalled();
    });

    it('should reject an invalid email', async () => {
      await expect(
        createUserUseCase.execute({
          ...input,
          email: 'invalid-email',
        }),
      ).rejects.toThrow();

      expect(findByEmail).not.toHaveBeenCalled();
      expect(save).not.toHaveBeenCalled();
    });

    it('should reject an invalid username', async () => {
      await expect(
        createUserUseCase.execute({
          ...input,
          username: 'invalid username',
        }),
      ).rejects.toThrow();

      expect(findByEmail).not.toHaveBeenCalled();
      expect(save).not.toHaveBeenCalled();
    });

    it('should propagate repository persistence errors', async () => {
      save.mockRejectedValue(new Error('Database error'));

      await expect(createUserUseCase.execute(input)).rejects.toThrow(
        'Database error',
      );
    });
  });
});
