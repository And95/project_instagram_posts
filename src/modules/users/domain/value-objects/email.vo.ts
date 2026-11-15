import { InvalidEmailError } from '../exceptions/invalid-email.error.js';

export class Email {
  private constructor(private readonly email: string) {}

  static create(value: string): Email {
    const normalizedEmail = value.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      throw new InvalidEmailError();
    }

    return new Email(normalizedEmail);
  }

  get value(): string {
    return this.email;
  }

  equals(other: Email): boolean {
    return this.email === other.email;
  }
}
