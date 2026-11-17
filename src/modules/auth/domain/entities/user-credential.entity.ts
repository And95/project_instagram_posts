import { InvalidUserCredentialError } from '../exceptions/invalid-user-credential.error.js';

import type {
  CreateUserCredentialProps,
  ReconstituteUserCredentialProps,
} from '../types/user-credential.types.js';

export class UserCredential {
  private constructor(
    private readonly _id: string,
    private readonly _userId: string,
    private readonly _passwordHash: string,
    private readonly _createdAt: Date,
    private readonly _updatedAt: Date,
  ) {}

  static create(props: CreateUserCredentialProps): UserCredential {
    if (!props.id.trim() || !props.userId.trim() || !props.passwordHash) {
      throw new InvalidUserCredentialError();
    }

    const now = new Date();

    return new UserCredential(
      props.id.trim(),
      props.userId.trim(),
      props.passwordHash,
      now,
      now,
    );
  }

  static reconstitute(props: ReconstituteUserCredentialProps): UserCredential {
    return new UserCredential(
      props.id,
      props.userId,
      props.passwordHash,
      props.createdAt,
      props.updatedAt,
    );
  }

  get id(): string {
    return this._id;
  }

  get userId(): string {
    return this._userId;
  }

  get passwordHash(): string {
    return this._passwordHash;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
