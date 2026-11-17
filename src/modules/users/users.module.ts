import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/database/prisma.module.js';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case.js';
import type { UserRepository } from './domain/repositories/user.repository.js';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository.js';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

@Module({
  imports: [PrismaModule],

  providers: [
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

  exports: [CreateUserUseCase, USER_REPOSITORY],
})
export class UsersModule {}
