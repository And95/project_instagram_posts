export class InvalidUserDisplayNameError extends Error {
  constructor() {
    super('The display name must contain between 2 and 50 characters.');
    this.name = 'InvalidUserDisplayNameError';
  }
}
