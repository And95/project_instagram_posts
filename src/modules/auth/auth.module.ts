import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { PrismaModule } from '../../infrastructure/database/prisma.module.js';

import type { AuthAccountRepository } from './domain/repositories/auth-account.repository.js';
import type { PasswordHasher } from './domain/services/password-hasher.js';
import type { TokenGenerator } from './domain/services/token-generator.js';

import { RegisterUserUseCase } from './application/use-cases/register-user.use-case.js';
import { LoginUserUseCase } from './application/use-cases/login.use-case.js';

import { PrismaAuthAccountRepository } from './infrastructure/repositories/prisma-auth-account.repository.js';
import { Argon2PasswordHasher } from './infrastructure/cryptography/argon2-password-hasher.js';
import { JwtTokenGenerator } from './infrastructure/cryptography/jwt-token-generator.js';

import { AuthResolver } from './presentation/graphql/auth.resolver.js';

import { JwtAuthGuard } from './presentation/graphql/guards/jwt-auth.guard.js';
import { JwtTokenVerifier } from './infrastructure/cryptography/jwt-token-verifier.js';

import {
  AUTH_ACCOUNT_REPOSITORY,
  PASSWORD_HASHER,
  TOKEN_GENERATOR,
  TOKEN_VERIFIER,
} from './auth.tokens.js';

@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [
    AuthResolver,
    JwtAuthGuard,

    {
      provide: AUTH_ACCOUNT_REPOSITORY,
      useClass: PrismaAuthAccountRepository,
    },
    {
      provide: PASSWORD_HASHER,
      useClass: Argon2PasswordHasher,
    },
    {
      provide: TOKEN_GENERATOR,
      useFactory: (configService: ConfigService) => {
        const secret = configService.getOrThrow<string>('JWT_SECRET');

        const expiresIn = configService.get<string>('JWT_EXPIRES_IN') ?? '15m';

        return new JwtTokenGenerator(secret, expiresIn);
      },
      inject: [ConfigService],
    },
    {
      provide: RegisterUserUseCase,
      useFactory: (
        repository: AuthAccountRepository,
        passwordHasher: PasswordHasher,
      ) => new RegisterUserUseCase(repository, passwordHasher),
      inject: [AUTH_ACCOUNT_REPOSITORY, PASSWORD_HASHER],
    },
    {
      provide: LoginUserUseCase,
      useFactory: (
        repository: AuthAccountRepository,
        passwordHasher: PasswordHasher,
        tokenGenerator: TokenGenerator,
      ) => new LoginUserUseCase(repository, passwordHasher, tokenGenerator),
      inject: [AUTH_ACCOUNT_REPOSITORY, PASSWORD_HASHER, TOKEN_GENERATOR],
    },
    {
      provide: TOKEN_VERIFIER,
      useFactory: (configService: ConfigService) => {
        const secret = configService.getOrThrow<string>('JWT_SECRET');

        return new JwtTokenVerifier(secret);
      },
      inject: [ConfigService],
    },
  ],
  exports: [JwtAuthGuard],
})
export class AuthModule {}
