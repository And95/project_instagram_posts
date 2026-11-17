import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/database/prisma.module.js';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case.js';
import type { UserRepository } from './domain/repositories/user.repository.js';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository.js';
import { GetCurrentUserUseCase } from './application/use-cases/get-current-user.use-case.js';
import { GetUserByIdUseCase } from './application/use-cases/get-user-by-id.use-case.js';

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
    {
      provide: GetCurrentUserUseCase,
      useFactory: (userRepository: UserRepository) => {
        return new GetCurrentUserUseCase(userRepository);
      },
      inject: [USER_REPOSITORY],
    },
    {
      provide: GetUserByIdUseCase,
      useFactory: (userRepository: UserRepository) => {
        return new GetUserByIdUseCase(userRepository);
      },
      inject: [USER_REPOSITORY],
    },
  ],

  exports: [
    CreateUserUseCase,
    GetCurrentUserUseCase,
    GetUserByIdUseCase,
    USER_REPOSITORY,
  ],
})
export class UsersModule {}
