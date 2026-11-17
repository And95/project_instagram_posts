import { UnauthorizedException, type ExecutionContext } from '@nestjs/common';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { TokenVerifier } from '../../../../domain/services/token-verifier.js';

import { JwtAuthGuard } from '../jwt-auth.guard.js';

describe('JwtAuthGuard', () => {
  let verifyMock: ReturnType<typeof vi.fn<TokenVerifier['verify']>>;
  let guard: JwtAuthGuard;

  const verifiedPayload = {
    sub: 'user-123',
    email: 'andre@example.com',
  };

  function createExecutionContext(authorization?: string): ExecutionContext {
    const graphqlContext = {
      req: {
        headers: {
          authorization,
        },
      },
    };

    return {
      getType: vi.fn().mockReturnValue('graphql'),
      getArgs: vi.fn().mockReturnValue([{}, {}, graphqlContext, {}]),
      getClass: vi.fn(),
      getHandler: vi.fn(),
    } as unknown as ExecutionContext;
  }

  beforeEach(() => {
    verifyMock = vi.fn<TokenVerifier['verify']>();

    const tokenVerifier: TokenVerifier = {
      verify: verifyMock,
    };

    guard = new JwtAuthGuard(tokenVerifier);
  });

  it('should authenticate a request with a valid JWT', async () => {
    verifyMock.mockResolvedValue(verifiedPayload);

    const context = createExecutionContext('Bearer valid-token');

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(verifyMock).toHaveBeenCalledWith('valid-token');

    const graphqlContext = context.getArgs()[2] as {
      user?: typeof verifiedPayload;
    };

    expect(graphqlContext.user).toEqual(verifiedPayload);
  });

  it('should reject a request without an authorization header', async () => {
    const context = createExecutionContext();

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Authentication required.'),
    );

    expect(verifyMock).not.toHaveBeenCalled();
  });

  it('should reject an invalid authorization format', async () => {
    const context = createExecutionContext('Invalid valid-token');

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Invalid authorization format.'),
    );

    expect(verifyMock).not.toHaveBeenCalled();
  });

  it('should reject a request with an empty bearer token', async () => {
    const context = createExecutionContext('Bearer ');

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Invalid authorization format.'),
    );

    expect(verifyMock).not.toHaveBeenCalled();
  });

  it('should reject a request with an invalid JWT', async () => {
    verifyMock.mockRejectedValue(new Error('Invalid JWT.'));

    const context = createExecutionContext('Bearer invalid-token');

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Invalid or expired access token.'),
    );
  });

  it('should reject a request with an expired JWT', async () => {
    verifyMock.mockRejectedValue(new Error('JWT expired.'));

    const context = createExecutionContext('Bearer expired-token');

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Invalid or expired access token.'),
    );
  });
});
