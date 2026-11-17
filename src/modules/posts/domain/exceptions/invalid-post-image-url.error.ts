export class InvalidPostImageUrlError extends Error {
  constructor() {
    super('Post image URL must be a valid HTTP or HTTPS URL.');
    this.name = 'InvalidPostImageUrlError';
  }
}
