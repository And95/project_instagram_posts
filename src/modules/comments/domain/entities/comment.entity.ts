import { InvalidCommentContentError } from '../exceptions/invalid-comment-content.error.js';
import { InvalidCommentParentError } from '../exceptions/invalid-comment-parent.error.js';
import { InvalidCommentReferenceError } from '../exceptions/invalid-comment-reference.error.js';

import type {
  CreateCommentProps,
  ReconstituteCommentProps,
  UpdateCommentProps,
} from '../types/comment.types.js';

const MAX_COMMENT_CONTENT_LENGTH = 2200;

export class Comment {
  private constructor(
    private readonly _id: string,
    private readonly _postId: string,
    private readonly _authorId: string,
    private readonly _parentCommentId: string | null,
    private _content: string,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  static create(props: CreateCommentProps): Comment {
    const content = this.validateContent(props.content);
    const parentCommentId = props.parentCommentId ?? null;

    if (!props.id.trim() || !props.postId.trim() || !props.authorId.trim()) {
      throw new InvalidCommentReferenceError(
        'Comment ID, post ID and author ID are required.',
      );
    }

    if (parentCommentId === props.id) {
      throw new InvalidCommentParentError();
    }

    return new Comment(
      props.id,
      props.postId,
      props.authorId,
      parentCommentId,
      content,
      new Date(),
      new Date(),
    );
  }

  static reconstitute(props: ReconstituteCommentProps): Comment {
    return new Comment(
      props.id,
      props.postId,
      props.authorId,
      props.parentCommentId,
      props.content,
      props.createdAt,
      props.updatedAt,
    );
  }

  updateContent(props: UpdateCommentProps): void {
    this._content = Comment.validateContent(props.content);
    this._updatedAt = new Date();
  }

  private static validateContent(content: string): string {
    const normalizedContent = content.trim();

    if (!normalizedContent) {
      throw new InvalidCommentContentError('Comment content cannot be empty.');
    }

    if (normalizedContent.length > MAX_COMMENT_CONTENT_LENGTH) {
      throw new InvalidCommentContentError(
        `Comment content cannot exceed ${MAX_COMMENT_CONTENT_LENGTH} characters.`,
      );
    }

    return normalizedContent;
  }

  get id(): string {
    return this._id;
  }

  get postId(): string {
    return this._postId;
  }

  get authorId(): string {
    return this._authorId;
  }

  get parentCommentId(): string | null {
    return this._parentCommentId;
  }

  get content(): string {
    return this._content;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
