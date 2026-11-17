import type { Post } from '../entities/post.entity.js';

export interface PostRepository {
  findById(id: string): Promise<Post | null>;

  findByAuthorId(authorId: string): Promise<Post[]>;

  save(post: Post): Promise<void>;

  delete(id: string): Promise<void>;
}
