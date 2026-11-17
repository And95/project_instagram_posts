import { randomUUID } from 'node:crypto';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { ConfigModule } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';

import { PrismaModule } from '../../../../infrastructure/database/prisma.module.js';
import { PrismaService } from '../../../../infrastructure/database/prisma.service.js';

import { User } from '../../../users/domain/entities/user.entity.js';
import { Email } from '../../../users/domain/value-objects/email.vo.js';
import { Username } from '../../../users/domain/value-objects/username.vo.js';

import { UserEmailAlreadyExistsError } from '../../../users/domain/exceptions/user-email-already-exists.error.js';
import { UsernameAlreadyExistsError } from '../../../users/domain/exceptions/username-already-exists.error.js';

import { UserCredential } from '../../domain/entities/user-credential.entity.js';

import { PrismaAuthAccountRepository } from '../repositories/prisma-auth-account.repository.js';

const suitePrefix = `authrepo-${randomUUID()}`;

function createAccountFixture(overrides?: {
  email?: string;
  username?: string;
}) {
  const user = User.create({
    id: randomUUID(),
    email: Email.create(
      overrides?.email ?? `${suitePrefix}-${randomUUID()}@example.com`,
    ),
    username: Username.create(
      overrides?.username ??
        `user${randomUUID().replaceAll('-', '').slice(0, 12)}`,
    ),
    displayName: 'Integration Test User',
  });

  const credential = UserCredential.create({
    id: randomUUID(),
    userId: user.id,
    passwordHash: 'integration-test-password-hash',
  });

  return { user, credential };
}

describe('PrismaAuthAccountRepository (Integration)', () => {
  let moduleRef: TestingModule;
  let prisma: PrismaService;
  let repository: PrismaAuthAccountRepository;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
        }),
        PrismaModule,
      ],
      providers: [PrismaAuthAccountRepository],
    }).compile();

    await moduleRef.init();

    prisma = moduleRef.get(PrismaService);
    repository = moduleRef.get(PrismaAuthAccountRepository);
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.user.deleteMany({
        where: {
          email: {
            startsWith: `${suitePrefix}-`,
          },
        },
      });
    }

    if (moduleRef) {
      await moduleRef.close();
    }
  });

  it('should create a user and credential in the database', async () => {
    const { user, credential } = createAccountFixture();

    await repository.createAccount(user, credential);

    const persistedUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { credential: true },
    });

    expect(persistedUser).not.toBeNull();

    expect(persistedUser?.email).toBe(user.email.value);
    expect(persistedUser?.username).toBe(user.username.value);

    expect(persistedUser?.credential).not.toBeNull();

    expect(persistedUser?.credential?.passwordHash).toBe(
      credential.passwordHash,
    );
  });

  it('should find an account by email', async () => {
    const { user, credential } = createAccountFixture();

    await repository.createAccount(user, credential);

    const account = await repository.findByEmail(user.email);

    expect(account).not.toBeNull();

    expect(account?.user).toBeInstanceOf(User);
    expect(account?.credential).toBeInstanceOf(UserCredential);

    expect(account?.user.email.value).toBe(user.email.value);
    expect(account?.credential.passwordHash).toBe(credential.passwordHash);
  });

  it('should find an account by username', async () => {
    const { user, credential } = createAccountFixture();

    await repository.createAccount(user, credential);

    const account = await repository.findByUsername(user.username);

    expect(account).not.toBeNull();

    expect(account?.user).toBeInstanceOf(User);
    expect(account?.credential).toBeInstanceOf(UserCredential);

    expect(account?.user.username.value).toBe(user.username.value);
  });

  it('should return null when an account does not exist', async () => {
    const email = Email.create(`${suitePrefix}-${randomUUID()}@example.com`);

    const username = Username.create(
      `user${randomUUID().replaceAll('-', '').slice(0, 12)}`,
    );

    await expect(repository.findByEmail(email)).resolves.toBeNull();

    await expect(repository.findByUsername(username)).resolves.toBeNull();
  });

  it('should rollback user creation when credential creation fails', async () => {
    const { user, credential } = createAccountFixture();

    const invalidCredential = UserCredential.create({
      id: credential.id,
      userId: randomUUID(),
      passwordHash: credential.passwordHash,
    });

    await expect(
      repository.createAccount(user, invalidCredential),
    ).rejects.toThrow();

    const persistedUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    expect(persistedUser).toBeNull();
  });

  it('should reject an existing email', async () => {
    const { user, credential } = createAccountFixture();

    await repository.createAccount(user, credential);

    const duplicateAccount = createAccountFixture({
      email: user.email.value,
    });

    await expect(
      repository.createAccount(
        duplicateAccount.user,
        duplicateAccount.credential,
      ),
    ).rejects.toBeInstanceOf(UserEmailAlreadyExistsError);
  });

  it('should reject an existing username', async () => {
    const { user, credential } = createAccountFixture();

    await repository.createAccount(user, credential);

    const duplicateAccount = createAccountFixture({
      username: user.username.value,
    });

    await expect(
      repository.createAccount(
        duplicateAccount.user,
        duplicateAccount.credential,
      ),
    ).rejects.toBeInstanceOf(UsernameAlreadyExistsError);
  });
});
