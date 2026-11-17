import type { Post } from '../../domain/entities/post.entity.js';
import { PostNotFoundError } from '../../domain/exceptions/post-not-found.error.js';
import { PostOwnershipError } from '../../domain/exceptions/post-ownership.error.js';
import type { PostRepository } from '../../domain/repositories/post.repository.js';
import type { UpdatePostInput } from '../types/update-post.input.js';

export class UpdatePostUseCase {
  constructor(private readonly postRepository: PostRepository) {}

  async execute(
    postId: string,
    userId: string,
    input: UpdatePostInput,
  ): Promise<Post> {
    const post = await this.postRepository.findById(postId);

    if (!post) {
      throw new PostNotFoundError();
    }

    if (post.authorId !== userId) {
      throw new PostOwnershipError();
    }

    post.updateContent(input);

    await this.postRepository.save(post);

    return post;
  }
}
