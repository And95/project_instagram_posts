import { User } from '../entities/user.entity.js';
import { Email } from '../value-objects/email.vo.js';
import { Username } from '../value-objects/username.vo.js';

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  findByUsername(username: Username): Promise<User | null>;
  save(user: User): Promise<void>;
}
