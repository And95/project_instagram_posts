import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';

import { AppModule } from '../src/app.module.js';

describe('Application (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should return the application health status', async () => {
    const query = `
      query {
        health {
          status
          service
          timestamp
        }
      }
    `;

    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query })
      .expect(200);

    expect(response.body.errors).toBeUndefined();

    expect(response.body.data.health).toEqual(
      expect.objectContaining({
        status: 'ok',
        service: 'project_instagram_posts',
      }),
    );

    expect(new Date(response.body.data.health.timestamp).toISOString()).toBe(
      response.body.data.health.timestamp,
    );
  });

  afterAll(async () => {
    await app.close();
  });
});
