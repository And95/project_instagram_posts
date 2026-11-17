export class InvalidCommentReferenceError extends Error {
  constructor(message = 'Comment references are invalid.') {
    super(message);
    this.name = 'InvalidCommentReferenceError';
  }
}
