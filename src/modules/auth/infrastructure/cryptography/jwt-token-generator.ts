import { SignJWT } from 'jose';

import type { TokenGenerator } from '../../domain/services/token-generator.js';

export class JwtTokenGenerator implements TokenGenerator {
  private readonly secretKey: Uint8Array;

  constructor(
    secret: string,
    private readonly expiresIn: string = '15m',
  ) {
    this.secretKey = new TextEncoder().encode(secret);

    if (this.secretKey.byteLength < 32) {
      throw new Error('JWT secret must contain at least 32 bytes.');
    }
  }

  async generate(payload: { sub: string; email: string }): Promise<string> {
    return new SignJWT({
      email: payload.email,
    })
      .setProtectedHeader({
        alg: 'HS256',
        typ: 'JWT',
      })
      .setSubject(payload.sub)
      .setIssuedAt()
      .setExpirationTime(this.expiresIn)
      .sign(this.secretKey);
  }
}
