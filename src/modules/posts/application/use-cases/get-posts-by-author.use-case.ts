import type { Post } from '../../domain/entities/post.entity.js';
import type { PostRepository } from '../../domain/repositories/post.repository.js';

export class GetPostsByAuthorUseCase {
  constructor(private readonly postRepository: PostRepository) {}

  async execute(authorId: string): Promise<Post[]> {
    return this.postRepository.findByAuthorId(authorId);
  }
}
