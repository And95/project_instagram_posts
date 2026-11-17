import {
  BadRequestException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';

import {
  Args,
  Mutation,
  Parent,
  Query,
  Resolver,
  ResolveField,
} from '@nestjs/graphql';

import { Post } from '../../domain/entities/post.entity.js';
import { User } from '../../../users/domain/entities/user.entity.js';

import { CreatePostUseCase } from '../../application/use-cases/create-post.use-case.js';
import { GetPostByIdUseCase } from '../../application/use-cases/get-post-by-id.use-case.js';
import { GetUserByIdUseCase } from '../../../users/application/use-cases/get-user-by-id.use-case.js';

import { CreatePostGraphqlInput } from './inputs/create-post.input.js';
import { PostOutput } from './outputs/post.output.js';
import { PostAuthorOutput } from './outputs/post-author.output.js';

import { JwtAuthGuard } from '../../../auth/presentation/graphql/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../../auth/presentation/graphql/decorators/current-user.decorator.js';

import type { VerifiedTokenPayload } from '../../../auth/domain/services/token-verifier.js';

import { InvalidPostImageUrlError } from '../../domain/exceptions/invalid-post-image-url.error.js';
import { InvalidPostCaptionError } from '../../domain/exceptions/invalid-post-caption.error.js';
import { UserNotFoundError } from '../../../users/domain/exceptions/user-not-found.error.js';

@Resolver(() => PostOutput)
export class PostsResolver {
  constructor(
    private readonly createPostUseCase: CreatePostUseCase,
    private readonly getPostByIdUseCase: GetPostByIdUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
  ) {}

  @Mutation(() => PostOutput)
  @UseGuards(JwtAuthGuard)
  async createPost(
    @Args('input', { type: () => CreatePostGraphqlInput })
    input: CreatePostGraphqlInput,
    @CurrentUser() user: VerifiedTokenPayload,
  ): Promise<PostOutput> {
    try {
      const post = await this.createPostUseCase.execute({
        authorId: user.sub,
        imageUrl: input.imageUrl,
        caption: input.caption,
      });

      return this.toPostOutput(post);
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  @Query(() => PostOutput, { nullable: true })
  async getPostById(@Args('id') id: string): Promise<PostOutput | null> {
    const post = await this.getPostByIdUseCase.execute(id);

    return post ? this.toPostOutput(post) : null;
  }

  @ResolveField(() => PostAuthorOutput)
  async author(@Parent() post: PostOutput): Promise<PostAuthorOutput> {
    const author = await this.getUserByIdUseCase.execute(post.authorId);

    if (!author) {
      throw new NotFoundException('Post author not found.');
    }

    return this.toAuthorOutput(author);
  }

  private toPostOutput(post: Post): PostOutput {
    return {
      id: post.id,
      authorId: post.authorId,
      imageUrl: post.imageUrl,
      caption: post.caption,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }

  private toAuthorOutput(user: User): PostAuthorOutput {
    return {
      id: user.id,
      username: user.username.value,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
    };
  }

  private handleError(error: unknown): never {
    if (
      error instanceof InvalidPostImageUrlError ||
      error instanceof InvalidPostCaptionError
    ) {
      throw new BadRequestException(error.message);
    }

    if (error instanceof UserNotFoundError) {
      throw new NotFoundException('User not found.');
    }

    throw error;
  }
}
