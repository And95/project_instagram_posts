export interface CreateUserCredentialProps {
  id: string;
  userId: string;
  passwordHash: string;
}

export interface ReconstituteUserCredentialProps extends CreateUserCredentialProps {
  createdAt: Date;
  updatedAt: Date;
}
