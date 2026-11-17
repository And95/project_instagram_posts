import { Email } from '../../../users/domain/value-objects/email.vo.js';
import { Username } from '../../../users/domain/value-objects/username.vo.js';
import { User } from '../../../users/domain/entities/user.entity.js';
import { UserCredential } from '../entities/user-credential.entity.js';

export interface AuthAccount {
  user: User;
  credential: UserCredential;
}

export interface AuthAccountRepository {
  createAccount(user: User, credential: UserCredential): Promise<void>;
  findByEmail(email: Email): Promise<AuthAccount | null>;
  findByUsername(username: Username): Promise<AuthAccount | null>;
}
