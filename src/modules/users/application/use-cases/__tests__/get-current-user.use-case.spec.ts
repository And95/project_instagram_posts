import { beforeEach, describe, expect, it, vi } from 'vitest';

import { User } from '../../../domain/entities/user.entity.js';
import { UserNotFoundError } from '../../../domain/exceptions/user-not-found.error.js';
import type { UserRepository } from '../../../domain/repositories/user.repository.js';
import { Email } from '../../../domain/value-objects/email.vo.js';
import { Username } from '../../../domain/value-objects/username.vo.js';

import { GetCurrentUserUseCase } from '../get-current-user.use-case.js';

describe('GetCurrentUserUseCase', () => {
  let userRepository: UserRepository;
  let useCase: GetCurrentUserUseCase;
  let findByIdMock: ReturnType<typeof vi.fn<UserRepository['findById']>>;

  const userId = 'user-123';

  const user = User.create({
    id: userId,
    email: Email.create('andre@example.com'),
    username: Username.create('andre_gonzaga'),
    displayName: 'André Gonzaga',
  });

  beforeEach(() => {
    findByIdMock = vi.fn();

    userRepository = {
      findById: findByIdMock,
      findByEmail: vi.fn(),
      findByUsername: vi.fn(),
      save: vi.fn(),
    };

    useCase = new GetCurrentUserUseCase(userRepository);
  });

  it('should return the user when found', async () => {
    findByIdMock.mockResolvedValue(user);

    const result = await useCase.execute({ userId });

    expect(result).toBe(user);
    expect(findByIdMock).toHaveBeenCalledWith(userId);
  });

  it('should throw UserNotFoundError when the user does not exist', async () => {
    findByIdMock.mockResolvedValue(null);

    await expect(useCase.execute({ userId })).rejects.toThrow(
      UserNotFoundError,
    );
  });

  it('should query the repository using the provided user ID', async () => {
    findByIdMock.mockResolvedValue(user);

    await useCase.execute({ userId });

    expect(findByIdMock).toHaveBeenCalledWith(userId);
    expect(findByIdMock).toHaveBeenCalledTimes(1);
  });
});
