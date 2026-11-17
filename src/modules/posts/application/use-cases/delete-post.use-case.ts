import { PostNotFoundError } from '../../domain/exceptions/post-not-found.error.js';
import { PostOwnershipError } from '../../domain/exceptions/post-ownership.error.js';
import type { PostRepository } from '../../domain/repositories/post.repository.js';

export class DeletePostUseCase {
  constructor(private readonly postRepository: PostRepository) {}

  async execute(postId: string, userId: string): Promise<void> {
    const post = await this.postRepository.findById(postId);

    if (!post) {
      throw new PostNotFoundError();
    }

    if (post.authorId !== userId) {
      throw new PostOwnershipError();
    }

    await this.postRepository.delete(postId);
  }
}
