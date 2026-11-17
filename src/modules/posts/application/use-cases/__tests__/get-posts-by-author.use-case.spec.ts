import { describe, expect, it, vi } from 'vitest';
import { GetPostsByAuthorUseCase } from '../get-posts-by-author.use-case.js';
import { Post } from '../../../domain/entities/post.entity.js';
import type { PostRepository } from '../../../domain/repositories/post.repository.js';

describe('GetPostsByAuthorUseCase', () => {
  const authorId = 'user-123';

  const posts = [
    Post.create({
      id: 'post-1',
      authorId,
      imageUrl: 'https://example.com/post-1.png',
      caption: 'First post',
    }),
    Post.create({
      id: 'post-2',
      authorId,
      imageUrl: 'https://example.com/post-2.png',
      caption: 'Second post',
    }),
  ];

  it('should return all posts from an author', async () => {
    const findByAuthorId = vi.fn().mockResolvedValue(posts);

    const postRepository: PostRepository = {
      findById: vi.fn(),
      findByAuthorId,
      save: vi.fn(),
      delete: vi.fn(),
    };

    const useCase = new GetPostsByAuthorUseCase(postRepository);

    const result = await useCase.execute(authorId);

    expect(result).toEqual(posts);
    expect(findByAuthorId).toHaveBeenCalledWith(authorId);
    expect(findByAuthorId).toHaveBeenCalledTimes(1);
  });

  it('should return an empty array when the author has no posts', async () => {
    const postRepository: PostRepository = {
      findById: vi.fn(),
      findByAuthorId: vi.fn().mockResolvedValue([]),
      save: vi.fn(),
      delete: vi.fn(),
    };

    const useCase = new GetPostsByAuthorUseCase(postRepository);

    const result = await useCase.execute(authorId);

    expect(result).toEqual([]);
  });

  it('should propagate repository errors', async () => {
    const error = new Error('Database connection failed');

    const postRepository: PostRepository = {
      findById: vi.fn(),
      findByAuthorId: vi.fn().mockRejectedValue(error),
      save: vi.fn(),
      delete: vi.fn(),
    };

    const useCase = new GetPostsByAuthorUseCase(postRepository);

    await expect(useCase.execute(authorId)).rejects.toThrow(error);
  });
});
