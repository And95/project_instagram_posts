import { describe, expect, it } from 'vitest';

import { User } from '../entities/user.entity.js';
import { Email } from '../value-objects/email.vo.js';
import { Username } from '../value-objects/username.vo.js';

describe('User', () => {
  const createUser = () =>
    User.create({
      id: 'user-123',
      email: Email.create('andre@example.com'),
      username: Username.create('andre_gonzaga'),
      displayName: 'André Gonzaga',
    });

  describe('create', () => {
    it('should create a valid user', () => {
      const user = createUser();

      expect(user.id).toBe('user-123');
      expect(user.displayName).toBe('André Gonzaga');
      expect(user.bio).toBeNull();
      expect(user.avatarUrl).toBeNull();
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should reject an empty user ID', () => {
      expect(() =>
        User.create({
          id: ' ',
          email: Email.create('andre@example.com'),
          username: Username.create('andre_gonzaga'),
          displayName: 'André Gonzaga',
        }),
      ).toThrow('User ID cannot be empty.');
    });
  });

  describe('updateProfile', () => {
    it('should update the user profile', () => {
      const user = createUser();

      user.updateProfile({
        displayName: 'André',
        bio: 'Software Engineer',
        avatarUrl: 'https://example.com/avatar.png',
      });

      expect(user.displayName).toBe('André');
      expect(user.bio).toBe('Software Engineer');
      expect(user.avatarUrl).toBe('https://example.com/avatar.png');
    });

    it('should normalize empty bio and avatar URL to null', () => {
      const user = User.create({
        id: 'user-123',
        email: Email.create('andre@example.com'),
        username: Username.create('andre_gonzaga'),
        displayName: 'André Gonzaga',
        bio: 'Software Engineer',
        avatarUrl: 'https://example.com/avatar.png',
      });

      user.updateProfile({
        bio: ' ',
        avatarUrl: ' ',
      });

      expect(user.bio).toBeNull();
      expect(user.avatarUrl).toBeNull();
    });
  });

  describe('reconstitute', () => {
    it('should preserve persisted timestamps', () => {
      const createdAt = new Date('2025-01-01T10:00:00.000Z');
      const updatedAt = new Date('2025-02-01T10:00:00.000Z');

      const user = User.reconstitute({
        id: 'user-123',
        email: Email.create('andre@example.com'),
        username: Username.create('andre_gonzaga'),
        displayName: 'André Gonzaga',
        bio: null,
        avatarUrl: null,
        createdAt,
        updatedAt,
      });

      expect(user.createdAt).toBe(createdAt);
      expect(user.updatedAt).toBe(updatedAt);
    });
  });
});
