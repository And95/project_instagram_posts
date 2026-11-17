export class InvalidCommentContentError extends Error {
  constructor(message = 'Comment content is invalid.') {
    super(message);
    this.name = 'InvalidCommentContentError';
  }
}
