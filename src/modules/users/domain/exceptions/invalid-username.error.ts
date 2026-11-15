export class InvalidUsernameError extends Error {
  constructor() {
    super('The provided username is invalid.');
    this.name = 'InvalidUsernameError';
  }
}
