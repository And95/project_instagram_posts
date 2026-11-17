import { InvalidPostImageUrlError } from '../exceptions/invalid-post-image-url.error.js';
import { InvalidPostCaptionError } from '../exceptions/invalid-post-caption.error.js';

import type {
  CreatePostProps,
  UpdatePostProps,
  ReconstitutePostProps,
} from '../types/post.types.js';

export class Post {
  private constructor(
    private readonly _id: string,
    private readonly _authorId: string,
    private _imageUrl: string,
    private _caption: string | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  static create(props: CreatePostProps): Post {
    if (!props.id.trim()) {
      throw new Error('Post ID cannot be empty.');
    }

    if (!props.authorId.trim()) {
      throw new Error('Post author ID cannot be empty.');
    }

    const now = new Date();

    return new Post(
      props.id.trim(),
      props.authorId.trim(),
      Post.validateImageUrl(props.imageUrl),
      Post.validateCaption(props.caption),
      now,
      now,
    );
  }

  static reconstitute(props: ReconstitutePostProps): Post {
    return new Post(
      props.id,
      props.authorId,
      props.imageUrl,
      props.caption,
      props.createdAt,
      props.updatedAt,
    );
  }

  private static validateImageUrl(value: string): string {
    const imageUrl = value.trim();

    try {
      const url = new URL(imageUrl);

      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new InvalidPostImageUrlError();
      }
    } catch {
      throw new InvalidPostImageUrlError();
    }

    return imageUrl;
  }

  private static validateCaption(
    value: string | null | undefined,
  ): string | null {
    const caption = value?.trim() || null;

    if (caption && caption.length > 2200) {
      throw new InvalidPostCaptionError();
    }

    return caption;
  }

  updateContent(props: UpdatePostProps): void {
    if (props.imageUrl !== undefined) {
      this._imageUrl = Post.validateImageUrl(props.imageUrl);
    }

    if (props.caption !== undefined) {
      this._caption = Post.validateCaption(props.caption);
    }

    this._updatedAt = new Date();
  }

  get id(): string {
    return this._id;
  }

  get authorId(): string {
    return this._authorId;
  }

  get imageUrl(): string {
    return this._imageUrl;
  }

  get caption(): string | null {
    return this._caption;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
