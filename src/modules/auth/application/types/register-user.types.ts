export interface RegisterUserInput {
  email: string;
  username: string;
  displayName: string;
  password: string;
  bio?: string;
  avatarUrl?: string;
}
