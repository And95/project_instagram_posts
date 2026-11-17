import {
  BadRequestException,
  ForbiddenException,
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
import { UpdatePostUseCase } from '../../application/use-cases/update-post.use-case.js';
import { UpdatePostGraphqlInput } from './inputs/update-post.input.js';
import { PostNotFoundError } from '../../domain/exceptions/post-not-found.error.js';
import { PostOwnershipError } from '../../domain/exceptions/post-ownership.error.js';
import { DeletePostUseCase } from '../../application/use-cases/delete-post.use-case.js';

@Resolver(() => PostOutput)
export class PostsResolver {
  constructor(
    private readonly createPostUseCase: CreatePostUseCase,
    private readonly getPostByIdUseCase: GetPostByIdUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly updatePostUseCase: UpdatePostUseCase,
    private readonly deletePostUseCase: DeletePostUseCase,
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

  @Mutation(() => PostOutput)
  @UseGuards(JwtAuthGuard)
  async updatePost(
    @Args('postId') postId: string,
    @Args('input', { type: () => UpdatePostGraphqlInput })
    input: UpdatePostGraphqlInput,
    @CurrentUser() user: VerifiedTokenPayload,
  ): Promise<PostOutput> {
    try {
      const post = await this.updatePostUseCase.execute(
        postId,
        user.sub,
        input,
      );

      return this.toPostOutput(post);
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deletePost(
    @Args('postId') postId: string,
    @CurrentUser() user: VerifiedTokenPayload,
  ): Promise<boolean> {
    try {
      await this.deletePostUseCase.execute(postId, user.sub);

      return true;
    } catch (error: unknown) {
      this.handleError(error);
    }
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

    if (error instanceof PostNotFoundError) {
      throw new NotFoundException('Post not found.');
    }

    if (error instanceof PostOwnershipError) {
      throw new ForbiddenException('You are not allowed to update this post.');
    }

    throw error;
  }
}
