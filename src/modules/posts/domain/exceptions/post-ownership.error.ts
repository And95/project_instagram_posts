export class PostOwnershipError extends Error {
  constructor() {
    super('User does not own this post.');
    this.name = 'PostOwnershipError';
  }
}
