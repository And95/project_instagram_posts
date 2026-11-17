import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { GqlExecutionContext } from '@nestjs/graphql';

import type { Request } from 'express';

import type { VerifiedTokenPayload } from '../../../domain/services/token-verifier.js';
import type { TokenVerifier } from '../../../domain/services/token-verifier.js';

import { TOKEN_VERIFIER } from '../../../auth.tokens.js';

interface GraphqlContext {
  req: Request;
  user?: VerifiedTokenPayload;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject(TOKEN_VERIFIER)
    private readonly tokenVerifier: TokenVerifier,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const graphqlContext = gqlContext.getContext<GraphqlContext>();

    const authorization = graphqlContext.req.headers.authorization;

    if (typeof authorization !== 'string') {
      throw new UnauthorizedException('Authentication required.');
    }

    const match = authorization.trim().match(/^Bearer\s+(\S+)$/i);

    if (!match) {
      throw new UnauthorizedException('Invalid authorization format.');
    }

    try {
      graphqlContext.user = await this.tokenVerifier.verify(match[1]);

      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired access token.');
    }
  }
}
