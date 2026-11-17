import { describe, expect, it } from 'vitest';

import { Argon2PasswordHasher } from '../argon2-password-hasher.js';

describe('Argon2PasswordHasher', () => {
  const passwordHasher = new Argon2PasswordHasher();

  it('should generate an Argon2id password hash', async () => {
    const password = 'StrongPassword123!';

    const passwordHash = await passwordHasher.hash(password);

    expect(passwordHash).toMatch(/^\$argon2id\$/);
    expect(passwordHash).not.toBe(password);
  });

  it('should verify a correct password', async () => {
    const password = 'StrongPassword123!';
    const passwordHash = await passwordHasher.hash(password);

    await expect(passwordHasher.verify(password, passwordHash)).resolves.toBe(
      true,
    );
  });

  it('should reject an incorrect password', async () => {
    const passwordHash = await passwordHasher.hash('StrongPassword123!');

    await expect(
      passwordHasher.verify('WrongPassword123!', passwordHash),
    ).resolves.toBe(false);
  });

  it('should generate different hashes for the same password', async () => {
    const password = 'StrongPassword123!';

    const firstHash = await passwordHasher.hash(password);
    const secondHash = await passwordHasher.hash(password);

    expect(firstHash).not.toBe(secondHash);

    await expect(passwordHasher.verify(password, firstHash)).resolves.toBe(
      true,
    );

    await expect(passwordHasher.verify(password, secondHash)).resolves.toBe(
      true,
    );
  });
});
