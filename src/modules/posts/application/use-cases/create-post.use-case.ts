import { randomUUID } from 'node:crypto';

import { Post } from '../../domain/entities/post.entity.js';
import type { PostRepository } from '../../domain/repositories/post.repository.js';

import type { UserRepository } from '../../../users/domain/repositories/user.repository.js';
import { UserNotFoundError } from '../../../users/domain/exceptions/user-not-found.error.js';

import type { CreatePostInput } from '../types/create-post.input.js';

export class CreatePostUseCase {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: CreatePostInput): Promise<Post> {
    const author = await this.userRepository.findById(input.authorId);

    if (!author) {
      throw new UserNotFoundError();
    }

    const post = Post.create({
      id: randomUUID(),
      authorId: author.id,
      imageUrl: input.imageUrl,
      caption: input.caption,
    });

    await this.postRepository.save(post);

    return post;
  }
}
