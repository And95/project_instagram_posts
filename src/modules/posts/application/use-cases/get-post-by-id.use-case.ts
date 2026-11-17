import type { Post } from '../../domain/entities/post.entity.js';
import type { PostRepository } from '../../domain/repositories/post.repository.js';

export class GetPostByIdUseCase {
  constructor(private readonly postRepository: PostRepository) {}

  async execute(id: string): Promise<Post | null> {
    return this.postRepository.findById(id);
  }
}
