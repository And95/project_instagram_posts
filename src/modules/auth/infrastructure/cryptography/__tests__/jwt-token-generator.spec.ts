import { jwtVerify } from 'jose';

import { describe, expect, it } from 'vitest';

import { JwtTokenGenerator } from '../jwt-token-generator.js';

describe('JwtTokenGenerator', () => {
  const secret = 'test-secret-that-is-at-least-32-bytes-long';

  const secretKey = new TextEncoder().encode(secret);

  it('should generate a valid JWT', async () => {
    const tokenGenerator = new JwtTokenGenerator(secret);

    const token = await tokenGenerator.generate({
      sub: 'user-123',
      email: 'andre@example.com',
    });

    const { payload, protectedHeader } = await jwtVerify(token, secretKey);

    expect(protectedHeader.alg).toBe('HS256');
    expect(protectedHeader.typ).toBe('JWT');

    expect(payload.sub).toBe('user-123');
    expect(payload.email).toBe('andre@example.com');
    expect(payload.iat).toBeDefined();
    expect(payload.exp).toBeDefined();
  });

  it('should use the configured expiration time', async () => {
    const tokenGenerator = new JwtTokenGenerator(secret, '30m');

    const token = await tokenGenerator.generate({
      sub: 'user-123',
      email: 'andre@example.com',
    });

    const { payload } = await jwtVerify(token, secretKey);

    expect(payload.exp! - payload.iat!).toBe(1800);
  });

  it('should reject a secret shorter than 32 bytes', () => {
    expect(() => new JwtTokenGenerator('short-secret')).toThrow(
      'JWT secret must contain at least 32 bytes.',
    );
  });

  it('should reject verification with an incorrect secret', async () => {
    const tokenGenerator = new JwtTokenGenerator(secret);

    const token = await tokenGenerator.generate({
      sub: 'user-123',
      email: 'andre@example.com',
    });

    const incorrectSecret = new TextEncoder().encode(
      'another-secret-that-is-at-least-32-bytes',
    );

    await expect(jwtVerify(token, incorrectSecret)).rejects.toThrow();
  });
});
