import { ArgumentsHost, Catch } from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';

import { UserEmailAlreadyExistsError } from '../../../domain/exceptions/user-email-already-exists.error.js';
import { UsernameAlreadyExistsError } from '../../../domain/exceptions/username-already-exists.error.js';

@Catch(UserEmailAlreadyExistsError, UsernameAlreadyExistsError)
export class UserConflictExceptionFilter implements GqlExceptionFilter {
  catch(
    exception: UserEmailAlreadyExistsError | UsernameAlreadyExistsError,
    _host: ArgumentsHost,
  ): GraphQLError {
    return new GraphQLError(exception.message, {
      extensions: {
        code: 'CONFLICT',
      },
    });
  }
}
