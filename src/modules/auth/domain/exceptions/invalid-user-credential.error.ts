export class InvalidUserCredentialError extends Error {
  constructor() {
    super('User credential data is invalid.');
    this.name = 'InvalidUserCredentialError';
  }
}
