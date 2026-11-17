import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

import { Post } from '../../../domain/entities/post.entity.js';
import { PostNotFoundError } from '../../../domain/exceptions/post-not-found.error.js';
import { PostOwnershipError } from '../../../domain/exceptions/post-ownership.error.js';
import type { PostRepository } from '../../../domain/repositories/post.repository.js';

import { DeletePostUseCase } from '../delete-post.use-case.js';

describe('DeletePostUseCase', () => {
  let postRepository: PostRepository;
  let deletePostUseCase: DeletePostUseCase;

  let findById: Mock<PostRepository['findById']>;
  let deletePost: Mock<PostRepository['delete']>;

  let post: Post;

  beforeEach(() => {
    findById = vi.fn<PostRepository['findById']>();
    deletePost = vi.fn<PostRepository['delete']>();

    postRepository = {
      findById,
      findByAuthorId: vi.fn(),
      save: vi.fn(),
      delete: deletePost,
    };

    deletePostUseCase = new DeletePostUseCase(postRepository);

    post = Post.create({
      id: 'post-123',
      authorId: 'user-123',
      imageUrl: 'https://example.com/image.jpg',
      caption: 'Minha publicação',
    });
  });

  it('should delete a post owned by the user', async () => {
    findById.mockResolvedValue(post);
    deletePost.mockResolvedValue(undefined);

    await expect(
      deletePostUseCase.execute('post-123', 'user-123'),
    ).resolves.toBeUndefined();

    expect(deletePost).toHaveBeenCalledWith('post-123');
  });

  it('should throw PostNotFoundError when the post does not exist', async () => {
    findById.mockResolvedValue(null);

    await expect(
      deletePostUseCase.execute('post-123', 'user-123'),
    ).rejects.toThrow(PostNotFoundError);

    expect(deletePost).not.toHaveBeenCalled();
  });

  it('should throw PostOwnershipError when the user is not the author', async () => {
    findById.mockResolvedValue(post);

    await expect(
      deletePostUseCase.execute('post-123', 'another-user'),
    ).rejects.toThrow(PostOwnershipError);

    expect(deletePost).not.toHaveBeenCalled();
  });

  it('should propagate repository errors when finding a post', async () => {
    const error = new Error('Database connection failed');

    findById.mockRejectedValue(error);

    await expect(
      deletePostUseCase.execute('post-123', 'user-123'),
    ).rejects.toThrow(error);
  });

  it('should propagate repository errors when deleting a post', async () => {
    findById.mockResolvedValue(post);

    const error = new Error('Database connection failed');

    deletePost.mockRejectedValue(error);

    await expect(
      deletePostUseCase.execute('post-123', 'user-123'),
    ).rejects.toThrow(error);
  });
});
