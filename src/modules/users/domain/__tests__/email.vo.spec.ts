import { describe, expect, it } from 'vitest';

import { Email } from '../value-objects/email.vo.js';

describe('Email', () => {
  describe('create', () => {
    it('should create a valid email', () => {
      const email = Email.create('andre@example.com');

      expect(email.value).toBe('andre@example.com');
    });

    it('should normalize email to lowercase', () => {
      const email = Email.create('ANDRE@EXAMPLE.COM');

      expect(email.value).toBe('andre@example.com');
    });

    it('should trim whitespace', () => {
      const email = Email.create(' andre@example.com ');

      expect(email.value).toBe('andre@example.com');
    });

    it.each([
      '',
      ' ',
      'invalid-email',
      'andre@',
      '@example.com',
      'andre@example',
    ])('should reject invalid email: "%s"', (value) => {
      expect(() => Email.create(value)).toThrow();
    });
  });

  describe('equality', () => {
    it('should consider normalized emails equal', () => {
      const first = Email.create('ANDRE@example.com');
      const second = Email.create('andre@example.com');

      expect(first.equals(second)).toBe(true);
    });

    it('should consider different emails unequal', () => {
      const first = Email.create('andre@example.com');
      const second = Email.create('other@example.com');

      expect(first.equals(second)).toBe(false);
    });
  });
});
