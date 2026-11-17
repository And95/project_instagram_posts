export class InvalidPasswordError extends Error {
  constructor() {
    super('Password must contain at least 8 characters.');
    this.name = 'InvalidPasswordError';
  }
}
