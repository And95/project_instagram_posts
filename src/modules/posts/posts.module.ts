import { Module } from '@nestjs/common';

import { PrismaModule } from '../../infrastructure/database/prisma.module.js';

import { UsersModule } from '../users/users.module.js';

import type { PostRepository } from './domain/repositories/post.repository.js';
import type { UserRepository } from '../users/domain/repositories/user.repository.js';

import { CreatePostUseCase } from './application/use-cases/create-post.use-case.js';
import { GetPostByIdUseCase } from './application/use-cases/get-post-by-id.use-case.js';
import { GetPostsByAuthorUseCase } from './application/use-cases/get-posts-by-author.use-case.js';

import { PrismaPostRepository } from './infrastructure/repositories/prisma-post.repository.js';

import { POST_REPOSITORY } from './posts.tokens.js';
import { USER_REPOSITORY } from '../users/users.module.js';
import { PostsResolver } from './presentation/graphql/posts.resolver.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule],

  providers: [
    PostsResolver,
    {
      provide: POST_REPOSITORY,
      useClass: PrismaPostRepository,
    },
    {
      provide: CreatePostUseCase,
      useFactory: (
        postRepository: PostRepository,
        userRepository: UserRepository,
      ) => {
        return new CreatePostUseCase(postRepository, userRepository);
      },
      inject: [POST_REPOSITORY, USER_REPOSITORY],
    },
    {
      provide: GetPostByIdUseCase,
      useFactory: (postRepository: PostRepository) => {
        return new GetPostByIdUseCase(postRepository);
      },
      inject: [POST_REPOSITORY],
    },
    {
      provide: GetPostsByAuthorUseCase,
      useFactory: (postRepository: PostRepository) => {
        return new GetPostsByAuthorUseCase(postRepository);
      },
      inject: [POST_REPOSITORY],
    },
  ],

  exports: [
    CreatePostUseCase,
    GetPostByIdUseCase,
    GetPostsByAuthorUseCase,
    POST_REPOSITORY,
  ],
})
export class PostsModule {}
