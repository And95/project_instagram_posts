import { UserConflictExceptionFilter } from './filters/user-conflict-exception.filter.js';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case.js';
import { CreateUserInputType } from './inputs/create-user.input.js';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { UserOutput } from './outputs/user.output.js';
import { UseFilters } from '@nestjs/common';

@UseFilters(UserConflictExceptionFilter)
@Resolver(() => UserOutput)
export class UsersResolver {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @Mutation(() => UserOutput, { name: 'createUser' })
  async createUser(
    @Args('input') input: CreateUserInputType,
  ): Promise<UserOutput> {
    const user = await this.createUserUseCase.execute(input);

    return UserOutput.fromDomain(user);
  }
}
