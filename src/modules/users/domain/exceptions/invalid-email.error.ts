export class InvalidEmailError extends Error {
  constructor() {
    super('The provided email address is invalid.');
    this.name = 'InvalidEmailError';
  }
}
