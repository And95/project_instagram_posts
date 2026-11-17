import 'dotenv/config';

import { randomUUID } from 'node:crypto';

import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '../../../../infrastructure/database/prisma.service.js';

import { PrismaPostRepository } from '../repositories/prisma-post.repository.js';
import { PrismaUserRepository } from '../../../users/infrastructure/repositories/prisma-user.repository.js';

import { Post } from '../../domain/entities/post.entity.js';
import { User } from '../../../users/domain/entities/user.entity.js';
import { Email } from '../../../users/domain/value-objects/email.vo.js';
import { Username } from '../../../users/domain/value-objects/username.vo.js';

describe('PrismaPostRepository (Integration)', () => {
  let prisma: PrismaService;
  let postRepository: PrismaPostRepository;
  let userRepository: PrismaUserRepository;

  const createdPostIds: string[] = [];
  const createdUserIds: string[] = [];

  beforeAll(async () => {
    const configService = new ConfigService();

    prisma = new PrismaService(configService);
    await prisma.$connect();

    postRepository = new PrismaPostRepository(prisma);
    userRepository = new PrismaUserRepository(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  afterEach(async () => {
    if (createdPostIds.length > 0) {
      await prisma.post.deleteMany({
        where: {
          id: {
            in: createdPostIds,
          },
        },
      });

      createdPostIds.length = 0;
    }

    if (createdUserIds.length > 0) {
      await prisma.user.deleteMany({
        where: {
          id: {
            in: createdUserIds,
          },
        },
      });

      createdUserIds.length = 0;
    }
  });

  async function createAuthor() {
    const id = randomUUID();

    createdUserIds.push(id);

    const user = User.create({
      id,
      email: Email.create(`integration-${id}@example.com`),
      username: Username.create(
        `integration${id.replaceAll('-', '').slice(0, 8)}`,
      ),
      displayName: 'Integration Test User',
      bio: 'Testing PrismaPostRepository',
      avatarUrl: null,
    });

    await userRepository.save(user);

    return user;
  }

  function createPost(authorId: string) {
    const id = randomUUID();

    createdPostIds.push(id);

    return Post.create({
      id,
      authorId,
      imageUrl: 'https://example.com/integration-post.png',
      caption: 'Integration test post',
    });
  }

  it('should find a post by ID', async () => {
    const author = await createAuthor();
    const post = createPost(author.id);

    await postRepository.save(post);

    const result = await postRepository.findById(post.id);

    expect(result).not.toBeNull();
    expect(result?.id).toBe(post.id);
    expect(result?.authorId).toBe(author.id);
    expect(result?.imageUrl).toBe(post.imageUrl);
    expect(result?.caption).toBe(post.caption);
  });

  it('should return null when post does not exist', async () => {
    const result = await postRepository.findById(randomUUID());

    expect(result).toBeNull();
  });

  it('should find posts by author ID', async () => {
    const author = await createAuthor();
    const anotherAuthor = await createAuthor();

    const firstPost = createPost(author.id);
    const secondPost = createPost(author.id);
    const anotherPost = createPost(anotherAuthor.id);

    await postRepository.save(firstPost);
    await postRepository.save(secondPost);
    await postRepository.save(anotherPost);

    const result = await postRepository.findByAuthorId(author.id);

    expect(result).toHaveLength(2);
    expect(result.map((post) => post.id)).toContain(firstPost.id);
    expect(result.map((post) => post.id)).toContain(secondPost.id);
    expect(result.every((post) => post.authorId === author.id)).toBe(true);
  });

  it('should return posts ordered by creation date, newest first', async () => {
    const author = await createAuthor();

    const olderPost = createPost(author.id);
    const newerPost = createPost(author.id);

    await postRepository.save(olderPost);
    await postRepository.save(newerPost);

    await prisma.post.update({
      where: { id: olderPost.id },
      data: {
        createdAt: new Date('2026-01-10T10:00:00.000Z'),
      },
    });

    await prisma.post.update({
      where: { id: newerPost.id },
      data: {
        createdAt: new Date('2026-02-10T10:00:00.000Z'),
      },
    });

    const result = await postRepository.findByAuthorId(author.id);

    expect(result.map((post) => post.id)).toEqual([newerPost.id, olderPost.id]);
  });

  it('should return an empty array when author has no posts', async () => {
    const author = await createAuthor();

    const result = await postRepository.findByAuthorId(author.id);

    expect(result).toEqual([]);
  });

  it('should create a post', async () => {
    const author = await createAuthor();
    const post = createPost(author.id);

    await postRepository.save(post);

    const result = await prisma.post.findUnique({
      where: { id: post.id },
    });

    expect(result).not.toBeNull();
    expect(result?.authorId).toBe(author.id);
    expect(result?.imageUrl).toBe(post.imageUrl);
    expect(result?.caption).toBe(post.caption);
  });

  it('should update an existing post without creating a duplicate', async () => {
    const author = await createAuthor();
    const post = createPost(author.id);

    await postRepository.save(post);

    post.updateContent({
      imageUrl: 'https://example.com/updated-post.png',
      caption: 'Updated integration test post',
    });

    await postRepository.save(post);

    const result = await postRepository.findById(post.id);

    expect(result).not.toBeNull();
    expect(result?.imageUrl).toBe('https://example.com/updated-post.png');
    expect(result?.caption).toBe('Updated integration test post');

    const count = await prisma.post.count({
      where: { id: post.id },
    });

    expect(count).toBe(1);
  });

  it('should delete a post', async () => {
    const author = await createAuthor();
    const post = createPost(author.id);

    await postRepository.save(post);
    await postRepository.delete(post.id);

    const result = await postRepository.findById(post.id);

    expect(result).toBeNull();
  });
});
