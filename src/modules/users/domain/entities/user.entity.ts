import { Email } from '../value-objects/email.vo.js';
import { Username } from '../value-objects/username.vo.js';

import { InvalidUserDisplayNameError } from '../exceptions/invalid-user-display-name.error.js';
import type {
  CreateUserProps,
  UpdateUserProfileProps,
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

    const displayName = props.displayName.trim();

    if (displayName.length < 2 || displayName.length > 50) {
      throw new InvalidUserDisplayNameError();
    }

    const now = new Date();

    return new User(
      props.id,
      props.email,
      props.username,
      displayName,
      props.bio?.trim() || null,
      props.avatarUrl?.trim() || null,
      now,
      now,
    );
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

  updateProfile(props: UpdateUserProfileProps): void {
    if (props.displayName !== undefined) {
      const displayName = props.displayName.trim();

      if (displayName.length < 2 || displayName.length > 50) {
        throw new InvalidUserDisplayNameError();
      }

      this._displayName = displayName;
    }

    if (props.bio !== undefined) {
      this._bio = props.bio?.trim() || null;
    }

    if (props.avatarUrl !== undefined) {
      this._avatarUrl = props.avatarUrl?.trim() || null;
    }

    this._updatedAt = new Date();
  }
}
