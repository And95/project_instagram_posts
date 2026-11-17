import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../infrastructure/database/prisma.service.js';

import { Post } from '../../domain/entities/post.entity.js';
import type { PostRepository } from '../../domain/repositories/post.repository.js';

@Injectable()
export class PrismaPostRepository implements PostRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Post | null> {
    const post = await this.prisma.post.findUnique({
      where: { id },
    });

    if (!post) return null;

    return this.toDomain(post);
  }

  async findByAuthorId(authorId: string): Promise<Post[]> {
    const posts = await this.prisma.post.findMany({
      where: { authorId },
      orderBy: { createdAt: 'desc' },
    });

    return posts.map((post) => this.toDomain(post));
  }

  async save(post: Post): Promise<void> {
    await this.prisma.post.upsert({
      where: { id: post.id },

      create: {
        id: post.id,
        authorId: post.authorId,
        imageUrl: post.imageUrl,
        caption: post.caption,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      },

      update: {
        imageUrl: post.imageUrl,
        caption: post.caption,
        updatedAt: post.updatedAt,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.post.deleteMany({
      where: { id },
    });
  }

  private toDomain(post: {
    id: string;
    authorId: string;
    imageUrl: string;
    caption: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): Post {
    return Post.reconstitute({
      id: post.id,
      authorId: post.authorId,
      imageUrl: post.imageUrl,
      caption: post.caption,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    });
  }
}
