import { describe, expect, it } from 'vitest';

import { UserCredential } from '../entities/user-credential.entity.js';
import { InvalidUserCredentialError } from '../exceptions/invalid-user-credential.error.js';

describe('UserCredential', () => {
  const validProps = {
    id: 'credential-123',
    userId: 'user-123',
    passwordHash: '$argon2id$v=19$example-hash',
  };

  describe('create', () => {
    it('should create a user credential', () => {
      const credential = UserCredential.create(validProps);

      expect(credential).toBeInstanceOf(UserCredential);
      expect(credential.id).toBe(validProps.id);
      expect(credential.userId).toBe(validProps.userId);
      expect(credential.passwordHash).toBe(validProps.passwordHash);
      expect(credential.createdAt).toBeInstanceOf(Date);
      expect(credential.updatedAt).toBeInstanceOf(Date);
    });

    it('should normalize the ID and user ID', () => {
      const credential = UserCredential.create({
        ...validProps,
        id: ' credential-123 ',
        userId: ' user-123 ',
      });

      expect(credential.id).toBe('credential-123');
      expect(credential.userId).toBe('user-123');
    });

    it('should reject an empty ID', () => {
      expect(() =>
        UserCredential.create({
          ...validProps,
          id: ' ',
        }),
      ).toThrow(InvalidUserCredentialError);
    });

    it('should reject an empty user ID', () => {
      expect(() =>
        UserCredential.create({
          ...validProps,
          userId: ' ',
        }),
      ).toThrow(InvalidUserCredentialError);
    });

    it('should reject an empty password hash', () => {
      expect(() =>
        UserCredential.create({
          ...validProps,
          passwordHash: '',
        }),
      ).toThrow(InvalidUserCredentialError);
    });
  });

  describe('reconstitute', () => {
    it('should restore a persisted credential', () => {
      const createdAt = new Date('2026-01-01T10:00:00.000Z');
      const updatedAt = new Date('2026-01-02T10:00:00.000Z');

      const credential = UserCredential.reconstitute({
        ...validProps,
        createdAt,
        updatedAt,
      });

      expect(credential).toBeInstanceOf(UserCredential);
      expect(credential.id).toBe(validProps.id);
      expect(credential.userId).toBe(validProps.userId);
      expect(credential.passwordHash).toBe(validProps.passwordHash);
      expect(credential.createdAt).toBe(createdAt);
      expect(credential.updatedAt).toBe(updatedAt);
    });
  });
});
