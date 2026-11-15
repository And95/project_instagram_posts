import { InvalidUsernameError } from '../exceptions/invalid-username.error.js';

export class Username {
  private constructor(private readonly username: string) {}

  static create(value: string): Username {
    const normalizedUsername = value.trim().toLowerCase();

    const usernameRegex = /^(?=.{3,30}$)[a-z0-9]+(?:[._][a-z0-9]+)*$/;

    if (!usernameRegex.test(normalizedUsername)) {
      throw new InvalidUsernameError();
    }

    return new Username(normalizedUsername);
  }

  get value(): string {
    return this.username;
  }

  equals(other: Username): boolean {
    return this.username === other.username;
  }
}
