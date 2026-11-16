import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/database/prisma.module.js';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case.js';
import type { UserRepository } from './domain/repositories/user.repository.js';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository.js';
import { UsersResolver } from './presentation/graphql/users.resolver.js';

// Dependency Injection Token
export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

@Module({
  imports: [PrismaModule],

  providers: [
    UsersResolver,
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },

    {
      provide: CreateUserUseCase,
      useFactory: (userRepository: UserRepository) => {
        return new CreateUserUseCase(userRepository);
      },
      inject: [USER_REPOSITORY],
    },
  ],

  exports: [CreateUserUseCase],
})
export class UsersModule {}
