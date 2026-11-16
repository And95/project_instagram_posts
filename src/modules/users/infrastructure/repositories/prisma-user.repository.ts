import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../infrastructure/database/prisma.service.js';

import { User } from '../../domain/entities/user.entity.js';
import type { UserRepository } from '../../domain/repositories/user.repository.js';

import { Email } from '../../domain/value-objects/email.vo.js';
import { Username } from '../../domain/value-objects/username.vo.js';

import { UserEmailAlreadyExistsError } from '../../domain/exceptions/user-email-already-exists.error.js';
import { UsernameAlreadyExistsError } from '../../domain/exceptions/username-already-exists.error.js';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;

    return this.toDomain(user);
  }

  async findByEmail(email: Email): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.value },
    });

    if (!user) return null;

    return this.toDomain(user);
  }

  async findByUsername(username: Username): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { username: username.value },
    });

    if (!user) return null;

    return this.toDomain(user);
  }

  async save(user: User): Promise<void> {
    try {
      await this.prisma.user.upsert({
        where: { id: user.id },

        create: {
          id: user.id,
          email: user.email.value,
          username: user.username.value,
          displayName: user.displayName,
          bio: user.bio,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },

        update: {
          email: user.email.value,
          username: user.username.value,
          displayName: user.displayName,
          bio: user.bio,
          avatarUrl: user.avatarUrl,
          updatedAt: user.updatedAt,
        },
      });
    } catch (error: unknown) {
      this.handlePersistenceError(error);
    }
  }

  private toDomain(user: {
    id: string;
    email: string;
    username: string;
    displayName: string;
    bio: string | null;
    avatarUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return User.reconstitute({
      id: user.id,
      email: Email.create(user.email),
      username: Username.create(user.username),
      displayName: user.displayName,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
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
