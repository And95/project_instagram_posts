import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../infrastructure/database/prisma.service.js';

import { User } from '../../../users/domain/entities/user.entity.js';
import { Email } from '../../../users/domain/value-objects/email.vo.js';
import { Username } from '../../../users/domain/value-objects/username.vo.js';

import { UserEmailAlreadyExistsError } from '../../../users/domain/exceptions/user-email-already-exists.error.js';
import { UsernameAlreadyExistsError } from '../../../users/domain/exceptions/username-already-exists.error.js';

import { UserCredential } from '../../domain/entities/user-credential.entity.js';

import type {
  AuthAccount,
  AuthAccountRepository,
} from '../../domain/repositories/auth-account.repository.js';

@Injectable()
export class PrismaAuthAccountRepository implements AuthAccountRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createAccount(user: User, credential: UserCredential): Promise<void> {
    try {
      await this.prisma.$transaction(async (transaction) => {
        await transaction.user.create({
          data: {
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

        await transaction.userCredential.create({
          data: {
            id: credential.id,
            userId: credential.userId,
            passwordHash: credential.passwordHash,
            createdAt: credential.createdAt,
            updatedAt: credential.updatedAt,
          },
        });
      });
    } catch (error: unknown) {
      this.handlePersistenceError(error);
    }
  }

  async findByEmail(email: Email): Promise<AuthAccount | null> {
    const account = await this.prisma.user.findUnique({
      where: { email: email.value },
      include: { credential: true },
    });

    if (!account) return null;

    const credential = account.credential;

    if (!credential) return null;

    return this.toDomain({
      ...account,
      credential,
    });
  }

  async findByUsername(username: Username): Promise<AuthAccount | null> {
    const account = await this.prisma.user.findUnique({
      where: { username: username.value },
      include: { credential: true },
    });

    if (!account) return null;

    const credential = account.credential;

    if (!credential) return null;

    return this.toDomain({
      ...account,
      credential,
    });
  }

  private toDomain(account: {
    id: string;
    email: string;
    username: string;
    displayName: string;
    bio: string | null;
    avatarUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
    credential: {
      id: string;
      userId: string;
      passwordHash: string;
      createdAt: Date;
      updatedAt: Date;
    };
  }): AuthAccount {
    const user = User.reconstitute({
      id: account.id,
      email: Email.create(account.email),
      username: Username.create(account.username),
      displayName: account.displayName,
      bio: account.bio,
      avatarUrl: account.avatarUrl,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    });

    const credential = UserCredential.reconstitute({
      id: account.credential.id,
      userId: account.credential.userId,
      passwordHash: account.credential.passwordHash,
      createdAt: account.credential.createdAt,
      updatedAt: account.credential.updatedAt,
    });

    return { user, credential };
  }

  private handlePersistenceError(error: unknown): never {
    if (typeof error !== 'object' || error === null) {
      throw error;
    }

    const prismaError = error as {
      code?: unknown;
      meta?: {
        target?: unknown;
        driverAdapterError?: {
          cause?: {
            constraint?: {
              index?: unknown;
            };
          };
        };
      };
    };

    if (prismaError.code === 'P2002') {
      const target = prismaError.meta?.target;

      const constraint =
        prismaError.meta?.driverAdapterError?.cause?.constraint?.index;

      let targetFields = '';

      if (typeof target === 'string') {
        targetFields = target;
      } else if (Array.isArray(target)) {
        targetFields = target
          .filter((field): field is string => typeof field === 'string')
          .join(' ');
      }

      const constraintIndex = typeof constraint === 'string' ? constraint : '';

      const fields = `${targetFields} ${constraintIndex}`.toLowerCase();

      if (fields.includes('email')) {
        throw new UserEmailAlreadyExistsError();
      }

      if (fields.includes('username')) {
        throw new UsernameAlreadyExistsError();
      }
    }

    throw error;
  }
}
