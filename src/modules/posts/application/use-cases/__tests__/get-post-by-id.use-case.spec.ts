import { describe, expect, it, vi } from 'vitest';
import { GetPostByIdUseCase } from '../get-post-by-id.use-case.js';
import { Post } from '../../../domain/entities/post.entity.js';
import type { PostRepository } from '../../../domain/repositories/post.repository.js';

describe('GetPostByIdUseCase', () => {
  const post = Post.create({
    id: 'post-123',
    authorId: 'user-123',
    imageUrl: 'https://example.com/post.png',
    caption: 'Test post',
  });

  it('should return a post when it exists', async () => {
    const findById = vi.fn().mockResolvedValue(post);

    const postRepository: PostRepository = {
      findById,
      findByAuthorId: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    };

    const useCase = new GetPostByIdUseCase(postRepository);

    const result = await useCase.execute('post-123');

    expect(result).toBe(post);
    expect(findById).toHaveBeenCalledWith('post-123');
    expect(findById).toHaveBeenCalledTimes(1);
  });

  it('should return null when the post does not exist', async () => {
    const findById = vi.fn().mockResolvedValue(null);

    const postRepository: PostRepository = {
      findById,
      findByAuthorId: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    };

    const useCase = new GetPostByIdUseCase(postRepository);

    const result = await useCase.execute('non-existent-id');

    expect(result).toBeNull();
    expect(findById).toHaveBeenCalledWith('non-existent-id');
  });

  it('should propagate repository errors', async () => {
    const error = new Error('Database connection failed');

    const postRepository: PostRepository = {
      findById: vi.fn().mockRejectedValue(error),
      findByAuthorId: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    };

    const useCase = new GetPostByIdUseCase(postRepository);

    await expect(useCase.execute('post-123')).rejects.toThrow(error);
  });
});
