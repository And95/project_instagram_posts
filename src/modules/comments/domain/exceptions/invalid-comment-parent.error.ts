export class InvalidCommentParentError extends Error {
  constructor(message = 'Comment cannot be its own parent.') {
    super(message);
    this.name = 'InvalidCommentParentError';
  }
}
