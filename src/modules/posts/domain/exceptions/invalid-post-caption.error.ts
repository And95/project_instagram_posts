export class InvalidPostCaptionError extends Error {
  constructor() {
    super('Post caption cannot exceed 2200 characters.');
    this.name = 'InvalidPostCaptionError';
  }
}
