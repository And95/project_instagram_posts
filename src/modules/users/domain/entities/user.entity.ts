import { Email } from '../value-objects/email.vo.js';
import { Username } from '../value-objects/username.vo.js';

import { InvalidUserDisplayNameError } from '../exceptions/invalid-user-display-name.error.js';

import type {
  CreateUserProps,
  UpdateUserProfileProps,
  ReconstituteUserProps,
} from '../types/user.types.js';

export class User {
  private constructor(
    private readonly _id: string,
    private readonly _email: Email,
    private readonly _username: Username,
    private _displayName: string,
    private _bio: string | null,
    private _avatarUrl: string | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  static create(props: CreateUserProps): User {
    if (!props.id.trim()) {
      throw new Error('User ID cannot be empty.');
    }

    const now = new Date();

    return new User(
      props.id.trim(),
      props.email,
      props.username,
      User.validateDisplayName(props.displayName),
      props.bio?.trim() || null,
      props.avatarUrl?.trim() || null,
      now,
      now,
    );
  }

  static reconstitute(props: ReconstituteUserProps): User {
    return new User(
      props.id,
      props.email,
      props.username,
      props.displayName,
      props.bio,
      props.avatarUrl,
      props.createdAt,
      props.updatedAt,
    );
  }

  private static validateDisplayName(value: string): string {
    const displayName = value.trim();

    if (displayName.length < 2 || displayName.length > 50) {
      throw new InvalidUserDisplayNameError();
    }

    return displayName;
  }

  updateProfile(props: UpdateUserProfileProps): void {
    if (props.displayName !== undefined) {
      this._displayName = User.validateDisplayName(props.displayName);
    }

    if (props.bio !== undefined) {
      this._bio = props.bio?.trim() || null;
    }

    if (props.avatarUrl !== undefined) {
      this._avatarUrl = props.avatarUrl?.trim() || null;
    }

    this._updatedAt = new Date();
  }

  get id(): string {
    return this._id;
  }

  get email(): Email {
    return this._email;
  }

  get username(): Username {
    return this._username;
  }

  get displayName(): string {
    return this._displayName;
  }

  get bio(): string | null {
    return this._bio;
  }

  get avatarUrl(): string | null {
    return this._avatarUrl;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
