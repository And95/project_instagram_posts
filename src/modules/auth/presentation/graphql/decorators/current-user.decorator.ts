import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

import { GqlExecutionContext } from '@nestjs/graphql';

import type { VerifiedTokenPayload } from '../../../domain/services/token-verifier.js';

interface GraphqlContext {
  user?: VerifiedTokenPayload;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): VerifiedTokenPayload => {
    const gqlContext = GqlExecutionContext.create(context);

    const graphqlContext = gqlContext.getContext<GraphqlContext>();

    if (!graphqlContext.user) {
      throw new UnauthorizedException('Authentication required.');
    }

    return graphqlContext.user;
  },
);
