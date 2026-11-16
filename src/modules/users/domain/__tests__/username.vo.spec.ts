import { describe, expect, it } from 'vitest';

import { Username } from '../value-objects/username.vo.js';

describe('Username', () => {
  describe('create', () => {
    it('should create a valid username', () => {
      const username = Username.create('andre_gonzaga');

      expect(username.value).toBe('andre_gonzaga');
    });

    it('should normalize username to lowercase', () => {
      const username = Username.create('ANDRE_GONZAGA');

      expect(username.value).toBe('andre_gonzaga');
    });

    it('should trim whitespace', () => {
      const username = Username.create(' andre_gonzaga ');

      expect(username.value).toBe('andre_gonzaga');
    });

    it.each(['', ' ', 'a', 'andre gonzaga', 'andre@gonzaga', 'andre..gonzaga'])(
      'should reject invalid username: "%s"',
      (value) => {
        expect(() => Username.create(value)).toThrow();
      },
    );
  });

  describe('equality', () => {
    it('should consider normalized usernames equal', () => {
      const first = Username.create('ANDRE_GONZAGA');
      const second = Username.create('andre_gonzaga');

      expect(first.equals(second)).toBe(true);
    });

    it('should consider different usernames unequal', () => {
      const first = Username.create('andre_gonzaga');
      const second = Username.create('andre_dev');

      expect(first.equals(second)).toBe(false);
    });
  });
});
