import { randomUUID } from 'node:crypto';

import { BadRequestException, UnauthorizedException } from '@nestjs/common';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { User } from '../../../../users/domain/entities/user.entity.js';
import { Email } from '../../../../users/domain/value-objects/email.vo.js';
import { Username } from '../../../../users/domain/value-objects/username.vo.js';

import { InvalidEmailError } from '../../../../users/domain/exceptions/invalid-email.error.js';
import { InvalidUsernameError } from '../../../../users/domain/exceptions/invalid-username.error.js';
import { InvalidUserDisplayNameError } from '../../../../users/domain/exceptions/invalid-user-display-name.error.js';
import { UserEmailAlreadyExistsError } from '../../../../users/domain/exceptions/user-email-already-exists.error.js';
import { UsernameAlreadyExistsError } from '../../../../users/domain/exceptions/username-already-exists.error.js';

import { InvalidCredentialsError } from '../../../domain/exceptions/invalid-credentials.error.js';
import { InvalidPasswordError } from '../../../domain/exceptions/invalid-password.error.js';

import { RegisterUserUseCase } from '../../../application/use-cases/register-user.use-case.js';
import { LoginUserUseCase } from '../../../application/use-cases/login.use-case.js';

import { AuthResolver } from '../auth.resolver.js';

describe('AuthResolver', () => {
  const registerUserExecute = vi.fn<RegisterUserUseCase['execute']>();
  const loginExecute = vi.fn<LoginUserUseCase['execute']>();

  const registerUserUseCase = {
    execute: registerUserExecute,
  } as unknown as RegisterUserUseCase;

  const loginUserUseCase = {
    execute: loginExecute,
  } as unknown as LoginUserUseCase;

  let resolver: AuthResolver;

  function createUserFixture(): User {
    return User.create({
      id: randomUUID(),
      email: Email.create('andre@example.com'),
      username: Username.create(
        `user${randomUUID().replaceAll('-', '').slice(0, 12)}`,
      ),
      displayName: 'Integration Test User',
      bio: 'Test bio',
      avatarUrl: 'https://example.com/avatar.png',
    });
  }

  beforeEach(() => {
    vi.clearAllMocks();

    resolver = new AuthResolver(registerUserUseCase, loginUserUseCase);
  });

  describe('registerUser', () => {
    it('should register a user and return the GraphQL output', async () => {
      const user = createUserFixture();

      registerUserExecute.mockResolvedValue(user);

      const result = await resolver.registerUser({
        email: user.email.value,
        username: user.username.value,
        displayName: user.displayName,
        password: 'correct-password',
      });

      expect(registerUserExecute).toHaveBeenCalledOnce();

      expect(result).toEqual({
        id: user.id,
        email: user.email.value,
        username: user.username.value,
        displayName: user.displayName,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    });

    it('should throw GraphQL CONFLICT when the email already exists', async () => {
      registerUserExecute.mockRejectedValue(new UserEmailAlreadyExistsError());

      await expect(
        resolver.registerUser({
          email: 'andre@example.com',
          username: 'andre_novo',
          displayName: 'André Teste',
          password: 'correct-password',
        }),
      ).rejects.toMatchObject({
        message: 'User email already exists.',
        extensions: {
          code: 'CONFLICT',
          status: 409,
        },
      });
    });

    it('should throw GraphQL CONFLICT when the username already exists', async () => {
      registerUserExecute.mockRejectedValue(new UsernameAlreadyExistsError());

      await expect(
        resolver.registerUser({
          email: 'novo@example.com',
          username: 'andre_teste',
          displayName: 'André Teste',
          password: 'correct-password',
        }),
      ).rejects.toMatchObject({
        message: 'Username already exists.',
        extensions: {
          code: 'CONFLICT',
          status: 409,
        },
      });
    });

    it('should throw BadRequestException when the email is invalid', async () => {
      const error = new InvalidEmailError();

      registerUserExecute.mockRejectedValue(error);

      await expect(
        resolver.registerUser({
          email: 'invalid-email',
          username: 'andre_teste',
          displayName: 'André Teste',
          password: 'correct-password',
        }),
      ).rejects.toThrow(new BadRequestException(error.message));
    });

    it('should throw BadRequestException when the username is invalid', async () => {
      const error = new InvalidUsernameError();

      registerUserExecute.mockRejectedValue(error);

      await expect(
        resolver.registerUser({
          email: 'andre@example.com',
          username: 'invalid-username',
          displayName: 'André Teste',
          password: 'correct-password',
        }),
      ).rejects.toThrow(new BadRequestException(error.message));
    });

    it('should throw BadRequestException when the display name is invalid', async () => {
      const error = new InvalidUserDisplayNameError();

      registerUserExecute.mockRejectedValue(error);

      await expect(
        resolver.registerUser({
          email: 'andre@example.com',
          username: 'andre_teste',
          displayName: '',
          password: 'correct-password',
        }),
      ).rejects.toThrow(new BadRequestException(error.message));
    });

    it('should throw BadRequestException when the password is invalid', async () => {
      const error = new InvalidPasswordError();

      registerUserExecute.mockRejectedValue(error);

      await expect(
        resolver.registerUser({
          email: 'andre@example.com',
          username: 'andre_teste',
          displayName: 'André Teste',
          password: '123',
        }),
      ).rejects.toThrow(new BadRequestException(error.message));
    });

    it('should propagate unexpected errors during registration', async () => {
      const error = new Error('Unexpected registration error');

      registerUserExecute.mockRejectedValue(error);

      await expect(
        resolver.registerUser({
          email: 'andre@example.com',
          username: 'andre_teste',
          displayName: 'André Teste',
          password: 'correct-password',
        }),
      ).rejects.toBe(error);
    });
  });

  describe('login', () => {
    it('should authenticate a user and return the access token and GraphQL output', async () => {
      const user = createUserFixture();

      loginExecute.mockResolvedValue({
        accessToken: 'generated-jwt-token',
        user,
      });

      const result = await resolver.login({
        email: user.email.value,
        password: 'correct-password',
      });

      expect(loginExecute).toHaveBeenCalledOnce();

      expect(result).toEqual({
        accessToken: 'generated-jwt-token',
        user: {
          id: user.id,
          email: user.email.value,
          username: user.username.value,
          displayName: user.displayName,
          bio: user.bio,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      loginExecute.mockRejectedValue(new InvalidCredentialsError());

      await expect(
        resolver.login({
          email: 'andre@example.com',
          password: 'wrong-password',
        }),
      ).rejects.toThrow(
        new UnauthorizedException('Invalid email or password.'),
      );
    });

    it('should propagate unexpected errors during login', async () => {
      const error = new Error('Unexpected login error');

      loginExecute.mockRejectedValue(error);

      await expect(
        resolver.login({
          email: 'andre@example.com',
          password: 'correct-password',
        }),
      ).rejects.toBe(error);
    });
  });
});
