import { jwtVerify } from 'jose';

import type {
  TokenVerifier,
  VerifiedTokenPayload,
} from '../../domain/services/token-verifier.js';

export class JwtTokenVerifier implements TokenVerifier {
  private readonly secretKey: Uint8Array;

  constructor(secret: string) {
    this.secretKey = new TextEncoder().encode(secret);

    if (this.secretKey.byteLength < 32) {
      throw new Error('JWT secret must contain at least 32 bytes.');
    }
  }

  async verify(token: string): Promise<VerifiedTokenPayload> {
    const { payload } = await jwtVerify(token, this.secretKey, {
      algorithms: ['HS256'],
    });

    if (typeof payload.sub !== 'string' || typeof payload.email !== 'string') {
      throw new Error('Invalid JWT payload.');
    }

    return {
      sub: payload.sub,
      email: payload.email,
    };
  }
}
