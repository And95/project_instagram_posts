import type { User } from '../../domain/entities/user.entity.js';
import type { UserRepository } from '../../domain/repositories/user.repository.js';

export class GetUserByIdUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }
}
