import type { Email } from '../value-objects/email.vo.js';
import type { Username } from '../value-objects/username.vo.js';

export interface CreateUserProps {
  id: string;
  email: Email;
  username: Username;
  displayName: string;
  bio?: string | null;
  avatarUrl?: string | null;
}

export interface UpdateUserProfileProps {
  displayName?: string;
  bio?: string | null;
  avatarUrl?: string | null;
}

export interface ReconstituteUserProps {
  id: string;
  email: Email;
  username: Username;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}
