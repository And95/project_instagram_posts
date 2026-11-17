import { describe, it, expect, vi, beforeEach } from 'vitest';

import { CreatePostUseCase } from '../create-post.use-case.js';

import type { PostRepository } from '../../../domain/repositories/post.repository.js';
import type { UserRepository } from '../../../../users/domain/repositories/user.repository.js';

import { User } from '../../../../users/domain/entities/user.entity.js';
import { Email } from '../../../../users/domain/value-objects/email.vo.js';
import { Username } from '../../../../users/domain/value-objects/username.vo.js';

import { UserNotFoundError } from '../../../../users/domain/exceptions/user-not-found.error.js';

describe('CreatePostUseCase', () => {
  let useCase: CreatePostUseCase;

  let postRepository: PostRepository;
  let userRepository: UserRepository;

  const user = User.create({
    id: 'user-123',
    email: Email.create('andre@example.com'),
    username: Username.create('andre_gonzaga'),
    displayName: 'André Gonzaga',
  });

  const saveMock = vi.fn<PostRepository['save']>();
  const findByIdMock = vi.fn<UserRepository['findById']>();

  beforeEach(() => {
    vi.clearAllMocks();

    postRepository = {
      findById: vi.fn(),
      findByAuthorId: vi.fn(),
      save: saveMock,
      delete: vi.fn(),
    };

    userRepository = {
      findById: findByIdMock,
      findByEmail: vi.fn(),
      findByUsername: vi.fn(),
      save: vi.fn(),
    };

    useCase = new CreatePostUseCase(postRepository, userRepository);
  });

  it('should create and persist a post when the author exists', async () => {
    findByIdMock.mockResolvedValue(user);
    saveMock.mockResolvedValue(undefined);

    const post = await useCase.execute({
      authorId: user.id,
      imageUrl: 'https://example.com/image.jpg',
      caption: 'Minha primeira publicação',
    });

    expect(post.id).toBeDefined();
    expect(post.authorId).toBe(user.id);
    expect(post.imageUrl).toBe('https://example.com/image.jpg');
    expect(post.caption).toBe('Minha primeira publicação');

    expect(findByIdMock).toHaveBeenCalledWith(user.id);
    expect(saveMock).toHaveBeenCalledWith(post);
  });

  it('should create a post without a caption', async () => {
    findByIdMock.mockResolvedValue(user);
    saveMock.mockResolvedValue(undefined);

    const post = await useCase.execute({
      authorId: user.id,
      imageUrl: 'https://example.com/image.jpg',
    });

    expect(post.caption).toBeNull();
    expect(saveMock).toHaveBeenCalledWith(post);
  });

  it('should throw when the author does not exist', async () => {
    findByIdMock.mockResolvedValue(null);

    await expect(
      useCase.execute({
        authorId: 'unknown-user',
        imageUrl: 'https://example.com/image.jpg',
      }),
    ).rejects.toThrow(UserNotFoundError);

    expect(saveMock).not.toHaveBeenCalled();
  });

  it('should not persist the post when repository save fails', async () => {
    findByIdMock.mockResolvedValue(user);
    saveMock.mockRejectedValue(new Error('Database error'));

    await expect(
      useCase.execute({
        authorId: user.id,
        imageUrl: 'https://example.com/image.jpg',
      }),
    ).rejects.toThrow('Database error');
  });
});
