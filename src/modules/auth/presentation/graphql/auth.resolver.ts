import { BadRequestException, UnauthorizedException } from '@nestjs/common';

import { GraphQLError } from 'graphql';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { User } from '../../../users/domain/entities/user.entity.js';

import { InvalidEmailError } from '../../../users/domain/exceptions/invalid-email.error.js';
import { InvalidUsernameError } from '../../../users/domain/exceptions/invalid-username.error.js';
import { InvalidUserDisplayNameError } from '../../../users/domain/exceptions/invalid-user-display-name.error.js';
import { UserEmailAlreadyExistsError } from '../../../users/domain/exceptions/user-email-already-exists.error.js';
import { UsernameAlreadyExistsError } from '../../../users/domain/exceptions/username-already-exists.error.js';

import { InvalidPasswordError } from '../../domain/exceptions/invalid-password.error.js';
import { InvalidCredentialsError } from '../../domain/exceptions/invalid-credentials.error.js';

import { RegisterUserUseCase } from '../../application/use-cases/register-user.use-case.js';
import { LoginUserUseCase } from '../../application/use-cases/login.use-case.js';

import { RegisterUserGraphqlInput } from './inputs/register-user.input.js';
import { LoginGraphqlInput } from './inputs/login.input.js';

import { AuthUserOutput } from './outputs/auth-user.output.js';
import { AuthPayloadOutput } from './outputs/auth-payload.output.js';

import { UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { CurrentUser } from './decorators/current-user.decorator.js';

import type { VerifiedTokenPayload } from '../../domain/services/token-verifier.js';

import { AuthenticatedIdentityOutput } from './outputs/authenticated-identity.output.js';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
  ) {}

  @Query(() => AuthenticatedIdentityOutput)
  @UseGuards(JwtAuthGuard)
  authenticatedIdentity(
    @CurrentUser() user: VerifiedTokenPayload,
  ): AuthenticatedIdentityOutput {
    return {
      id: user.sub,
      email: user.email,
    };
  }

  @Mutation(() => AuthUserOutput)
  async registerUser(
    @Args('input', { type: () => RegisterUserGraphqlInput })
    input: RegisterUserGraphqlInput,
  ): Promise<AuthUserOutput> {
    try {
      const user = await this.registerUserUseCase.execute(input);

      return this.toUserOutput(user);
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  @Mutation(() => AuthPayloadOutput)
  async login(
    @Args('input', { type: () => LoginGraphqlInput })
    input: LoginGraphqlInput,
  ): Promise<AuthPayloadOutput> {
    try {
      const result = await this.loginUserUseCase.execute(input);

      return {
        accessToken: result.accessToken,
        user: this.toUserOutput(result.user),
      };
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  private toUserOutput(user: User): AuthUserOutput {
    return {
      id: user.id,
      email: user.email.value,
      username: user.username.value,
      displayName: user.displayName,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private handleError(error: unknown): never {
    if (error instanceof InvalidCredentialsError) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (
      error instanceof UserEmailAlreadyExistsError ||
      error instanceof UsernameAlreadyExistsError
    ) {
      throw new GraphQLError(error.message, {
        extensions: {
          code: 'CONFLICT',
          status: 409,
        },
      });
    }

    if (
      error instanceof InvalidEmailError ||
      error instanceof InvalidUsernameError ||
      error instanceof InvalidUserDisplayNameError ||
      error instanceof InvalidPasswordError
    ) {
      throw new BadRequestException(error.message);
    }

    throw error;
  }
}
