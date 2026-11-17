import { SignJWT } from 'jose';

import { describe, expect, it } from 'vitest';

import { JwtTokenVerifier } from '../jwt-token-verifier.js';

describe('JwtTokenVerifier', () => {
  const secret = 'test-secret-that-is-at-least-32-bytes-long';

  const secretKey = new TextEncoder().encode(secret);

  async function createToken(
    payload: Record<string, unknown>,
    signingKey: Uint8Array = secretKey,
    expiration: string | number = '15m',
  ): Promise<string> {
    return new SignJWT(payload)
      .setProtectedHeader({
        alg: 'HS256',
        typ: 'JWT',
      })
      .setIssuedAt()
      .setExpirationTime(expiration)
      .sign(signingKey);
  }

  it('should verify a valid JWT', async () => {
    const tokenVerifier = new JwtTokenVerifier(secret);

    const token = await createToken({
      sub: 'user-123',
      email: 'andre@example.com',
    });

    const payload = await tokenVerifier.verify(token);

    expect(payload).toEqual({
      sub: 'user-123',
      email: 'andre@example.com',
    });
  });

  it('should reject an expired JWT', async () => {
    const tokenVerifier = new JwtTokenVerifier(secret);

    const token = await createToken(
      {
        sub: 'user-123',
        email: 'andre@example.com',
      },
      secretKey,
      Math.floor(Date.now() / 1000) - 1,
    );

    await expect(tokenVerifier.verify(token)).rejects.toThrow();
  });

  it('should reject a JWT with an invalid signature', async () => {
    const tokenVerifier = new JwtTokenVerifier(secret);

    const incorrectSecret = new TextEncoder().encode(
      'another-secret-that-is-at-least-32-bytes',
    );

    const token = await createToken(
      {
        sub: 'user-123',
        email: 'andre@example.com',
      },
      incorrectSecret,
    );

    await expect(tokenVerifier.verify(token)).rejects.toThrow();
  });

  it('should reject a JWT without a subject', async () => {
    const tokenVerifier = new JwtTokenVerifier(secret);

    const token = await createToken({
      email: 'andre@example.com',
    });

    await expect(tokenVerifier.verify(token)).rejects.toThrow(
      'Invalid JWT payload.',
    );
  });

  it('should reject a JWT without an email', async () => {
    const tokenVerifier = new JwtTokenVerifier(secret);

    const token = await createToken({
      sub: 'user-123',
    });

    await expect(tokenVerifier.verify(token)).rejects.toThrow(
      'Invalid JWT payload.',
    );
  });

  it('should reject a secret shorter than 32 bytes', () => {
    expect(() => new JwtTokenVerifier('short-secret')).toThrow(
      'JWT secret must contain at least 32 bytes.',
    );
  });
});
