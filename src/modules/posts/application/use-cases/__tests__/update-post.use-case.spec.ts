import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

import { Post } from '../../../domain/entities/post.entity.js';
import { PostNotFoundError } from '../../../domain/exceptions/post-not-found.error.js';
import { PostOwnershipError } from '../../../domain/exceptions/post-ownership.error.js';
import type { PostRepository } from '../../../domain/repositories/post.repository.js';

import { UpdatePostUseCase } from '../update-post.use-case.js';

describe('UpdatePostUseCase', () => {
  let postRepository: PostRepository;
  let updatePostUseCase: UpdatePostUseCase;

  let findById: Mock<PostRepository['findById']>;
  let save: Mock<PostRepository['save']>;

  let post: Post;

  beforeEach(() => {
    findById = vi.fn<PostRepository['findById']>();
    save = vi.fn<PostRepository['save']>();

    postRepository = {
      findById,
      findByAuthorId: vi.fn(),
      save,
      delete: vi.fn(),
    };

    updatePostUseCase = new UpdatePostUseCase(postRepository);

    post = Post.create({
      id: 'post-123',
      authorId: 'user-123',
      imageUrl: 'https://example.com/original.jpg',
      caption: 'Legenda original',
    });
  });

  it('should update the post caption', async () => {
    findById.mockResolvedValue(post);
    save.mockResolvedValue(undefined);

    const result = await updatePostUseCase.execute('post-123', 'user-123', {
      caption: 'Nova legenda',
    });

    expect(result.caption).toBe('Nova legenda');
    expect(save).toHaveBeenCalledWith(post);
  });

  it('should update the post image URL', async () => {
    findById.mockResolvedValue(post);
    save.mockResolvedValue(undefined);

    const result = await updatePostUseCase.execute('post-123', 'user-123', {
      imageUrl: 'https://example.com/updated.jpg',
    });

    expect(result.imageUrl).toBe('https://example.com/updated.jpg');
    expect(save).toHaveBeenCalledWith(post);
  });

  it('should update the image URL and caption', async () => {
    findById.mockResolvedValue(post);
    save.mockResolvedValue(undefined);

    const result = await updatePostUseCase.execute('post-123', 'user-123', {
      imageUrl: 'https://example.com/new.jpg',
      caption: 'Nova publicação',
    });

    expect(result.imageUrl).toBe('https://example.com/new.jpg');
    expect(result.caption).toBe('Nova publicação');
    expect(save).toHaveBeenCalledWith(post);
  });

  it('should throw PostNotFoundError when the post does not exist', async () => {
    findById.mockResolvedValue(null);

    await expect(
      updatePostUseCase.execute('post-123', 'user-123', {
        caption: 'Nova legenda',
      }),
    ).rejects.toThrow(PostNotFoundError);

    expect(save).not.toHaveBeenCalled();
  });

  it('should throw PostOwnershipError when the user is not the author', async () => {
    findById.mockResolvedValue(post);

    await expect(
      updatePostUseCase.execute('post-123', 'another-user', {
        caption: 'Tentativa de alteração',
      }),
    ).rejects.toThrow(PostOwnershipError);

    expect(save).not.toHaveBeenCalled();
  });

  it('should propagate repository errors when finding a post', async () => {
    const error = new Error('Database connection failed');

    findById.mockRejectedValue(error);

    await expect(
      updatePostUseCase.execute('post-123', 'user-123', {
        caption: 'Nova legenda',
      }),
    ).rejects.toThrow(error);
  });

  it('should propagate repository errors when saving a post', async () => {
    findById.mockResolvedValue(post);

    const error = new Error('Database connection failed');

    save.mockRejectedValue(error);

    await expect(
      updatePostUseCase.execute('post-123', 'user-123', {
        caption: 'Nova legenda',
      }),
    ).rejects.toThrow(error);
  });
});
