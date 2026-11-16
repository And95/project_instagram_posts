import { ArgumentsHost, Catch } from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';

import { InvalidEmailError } from '../../../domain/exceptions/invalid-email.error.js';
import { InvalidUsernameError } from '../../../domain/exceptions/invalid-username.error.js';
import { UserEmailAlreadyExistsError } from '../../../domain/exceptions/user-email-already-exists.error.js';
import { UsernameAlreadyExistsError } from '../../../domain/exceptions/username-already-exists.error.js';

@Catch(
  UserEmailAlreadyExistsError,
  UsernameAlreadyExistsError,
  InvalidEmailError,
  InvalidUsernameError,
)
export class UserConflictExceptionFilter implements GqlExceptionFilter {
  catch(
    exception:
      | UserEmailAlreadyExistsError
      | UsernameAlreadyExistsError
      | InvalidEmailError
      | InvalidUsernameError,
    _host: ArgumentsHost,
  ): GraphQLError {
    const isConflict =
      exception instanceof UserEmailAlreadyExistsError ||
      exception instanceof UsernameAlreadyExistsError;

    return new GraphQLError(exception.message, {
      extensions: {
        code: isConflict ? 'CONFLICT' : 'BAD_USER_INPUT',
      },
    });
  }
}
