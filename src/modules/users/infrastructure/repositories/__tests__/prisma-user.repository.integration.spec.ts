import 'dotenv/config';

import { randomUUID } from 'node:crypto';

import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '../../../../../infrastructure/database/prisma.service.js';

import { PrismaUserRepository } from '../prisma-user.repository.js';

import { User } from '../../../domain/entities/user.entity.js';
import { Email } from '../../../domain/value-objects/email.vo.js';
import { Username } from '../../../domain/value-objects/username.vo.js';

import { UserEmailAlreadyExistsError } from '../../../domain/exceptions/user-email-already-exists.error.js';

import { UsernameAlreadyExistsError } from '../../../domain/exceptions/username-already-exists.error.js';

describe('PrismaUserRepository (Integration)', () => {
  let prisma: PrismaService;
  let repository: PrismaUserRepository;

  let userId: string;

  const createdUserIds: string[] = [];

  beforeAll(async () => {
    const configService = new ConfigService();

    prisma = new PrismaService(configService);
    await prisma.$connect();

    repository = new PrismaUserRepository(prisma);
  });

  beforeEach(() => {
    userId = randomUUID();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  afterEach(async () => {
    if (createdUserIds.length > 0) {
      await prisma.user.deleteMany({
        where: {
          id: {
            in: createdUserIds,
          },
        },
      });

      createdUserIds.length = 0;
    }
  });

  function createUser(
    overrides: {
      email?: Email;
      username?: Username;
    } = {},
  ) {
    const id = randomUUID();

    createdUserIds.push(id);

    return User.create({
      id,
      email: overrides.email ?? Email.create(`integration-${id}@example.com`),
      username:
        overrides.username ??
        Username.create(`integration${id.replaceAll('-', '').slice(0, 8)}`),
      displayName: 'Integration Test User',
      bio: 'Testing PrismaUserRepository',
      avatarUrl: null,
    });
  }

  it('should find a user by ID', async () => {
    const user = createUser();

    await repository.save(user);

    const result = await repository.findById(user.id);

    expect(result).not.toBeNull();
    expect(result?.id).toBe(user.id);
    expect(result?.email.equals(user.email)).toBe(true);
    expect(result?.username.equals(user.username)).toBe(true);
    expect(result?.displayName).toBe(user.displayName);
  });

  it('should return null when user does not exist', async () => {
    const result = await repository.findById(randomUUID());

    expect(result).toBeNull();
  });

  it('should find a user by email', async () => {
    const user = createUser();

    await repository.save(user);

    const result = await repository.findByEmail(user.email);

    expect(result).not.toBeNull();
    expect(result?.id).toBe(user.id);
    expect(result?.email.equals(user.email)).toBe(true);
  });

  it('should find a user by username', async () => {
    const user = createUser();

    await repository.save(user);

    const result = await repository.findByUsername(user.username);

    expect(result).not.toBeNull();
    expect(result?.id).toBe(user.id);
    expect(result?.username.equals(user.username)).toBe(true);
  });

  it('should update an existing user without creating a duplicate', async () => {
    const user = createUser();

    await repository.save(user);

    user.updateProfile({
      displayName: 'Updated Integration User',
      bio: 'Updated bio',
      avatarUrl: 'https://example.com/avatar.png',
    });

    await repository.save(user);

    const result = await repository.findById(user.id);

    expect(result).not.toBeNull();
    expect(result?.displayName).toBe('Updated Integration User');
    expect(result?.bio).toBe('Updated bio');
    expect(result?.avatarUrl).toBe('https://example.com/avatar.png');

    const count = await prisma.user.count({
      where: { id: user.id },
    });

    expect(count).toBe(1);
  });

  it('should throw when saving a user with an existing email', async () => {
    const firstUser = createUser();

    await repository.save(firstUser);

    const secondUser = createUser({
      email: firstUser.email,
    });

    await expect(repository.save(secondUser)).rejects.toBeInstanceOf(
      UserEmailAlreadyExistsError,
    );
  });

  it('should throw when saving a user with an existing username', async () => {
    const firstUser = createUser();

    await repository.save(firstUser);

    const secondUser = createUser({
      username: firstUser.username,
    });

    await expect(repository.save(secondUser)).rejects.toBeInstanceOf(
      UsernameAlreadyExistsError,
    );
  });
});
