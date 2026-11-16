import { randomUUID } from 'node:crypto';

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import request from 'supertest';
import { App } from 'supertest/types.js';

import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/infrastructure/database/prisma.service.js';

describe('UsersResolver (e2e)', () => {
  let app: INestApplication<App>;

  const createdUserIds: string[] = [];

  const createUserMutation = `
    mutation CreateUser($input: CreateUserInputType!) {
      createUser(input: $input) {
        id
        email
        username
        displayName
        bio
        avatarUrl
        createdAt
        updatedAt
      }
    }
  `;

  function createUserInput(overrides = {}) {
    const id = randomUUID();

    return {
      email: `e2e-${id}@example.com`,
      username: `e2e${id.replaceAll('-', '').slice(0, 12)}`,
      displayName: 'E2E Test User',
      bio: 'Testing GraphQL user creation',
      avatarUrl: null,
      ...overrides,
    };
  }

  async function executeCreateUser(input: object) {
    return request(app.getHttpServer()).post('/graphql').send({
      query: createUserMutation,
      variables: { input },
    });
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    await app.init();
  });

  afterAll(async () => {
    if (createdUserIds.length > 0) {
      const prisma = app.get(PrismaService);

      await prisma.user.deleteMany({
        where: {
          id: { in: createdUserIds },
        },
      });
    }

    await app.close();
  });

  it('should create a user successfully', async () => {
    const input = createUserInput();

    const response = await executeCreateUser(input);

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();

    const user = response.body.data.createUser;

    // Register the user for cleanup before further assertions.
    createdUserIds.push(user.id);

    // Verify persistence in PostgreSQL.
    const prisma = app.get(PrismaService);

    const persistedUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    expect(persistedUser).not.toBeNull();

    expect(persistedUser).toMatchObject({
      id: user.id,
      email: input.email,
      username: input.username,
      displayName: input.displayName,
      bio: input.bio,
      avatarUrl: null,
    });

    expect(user).toEqual(
      expect.objectContaining({
        email: input.email,
        username: input.username,
        displayName: input.displayName,
        bio: input.bio,
        avatarUrl: null,
      }),
    );

    expect(user.id).toBeDefined();
    expect(user.createdAt).toBeDefined();
    expect(user.updatedAt).toBeDefined();

    createdUserIds.push(user.id);
  });

  it('should reject a user with an existing email', async () => {
    const firstInput = createUserInput();

    const firstResponse = await executeCreateUser(firstInput);

    expect(firstResponse.body.errors).toBeUndefined();

    createdUserIds.push(firstResponse.body.data.createUser.id);

    const secondInput = createUserInput({
      email: firstInput.email,
    });

    const response = await executeCreateUser(secondInput);

    expect(response.status).toBe(200);
    expect(response.body.errors[0].extensions.code).toBe('CONFLICT');
  });

  it('should reject a user with an existing username', async () => {
    const firstInput = createUserInput();

    const firstResponse = await executeCreateUser(firstInput);

    expect(firstResponse.body.errors).toBeUndefined();

    createdUserIds.push(firstResponse.body.data.createUser.id);

    const secondInput = createUserInput({
      username: firstInput.username,
    });

    const response = await executeCreateUser(secondInput);

    expect(response.status).toBe(200);
    expect(response.body.errors[0].extensions.code).toBe('CONFLICT');
  });

  it('should reject an invalid email', async () => {
    const input = createUserInput({
      email: 'not-an-email',
    });

    const response = await executeCreateUser(input);

    expect(response.status).toBe(200);
    expect(response.body.data).toBeNull();
    expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');
  });

  it('should reject an invalid username', async () => {
    const input = createUserInput({
      username: 'ab',
    });

    const response = await executeCreateUser(input);

    expect(response.status).toBe(200);
    expect(response.body.data).toBeNull();
    expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');
  });
});
