import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'node:path';
import type { Request } from 'express';

import { createObserveModule } from '@nestjs/observe';
import { HealthModule } from './modules/health/health.module.js';
import { PrismaModule } from './infrastructure/database/prisma.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { PostsModule } from './modules/posts/posts.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    PrismaModule,
    UsersModule,
    AuthModule,
    PostsModule,

    ObserveModule.forRoot({
      appKey: process.env.OBSERVE_APP_KEY ?? 'YOUR_APP_KEY',
      appSecret: process.env.OBSERVE_APP_SECRET ?? 'YOUR_APP_SECRET',
      serviceId: 'project_instagram_posts',
    }),

    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      graphiql: process.env.NODE_ENV !== 'production',

      context: ({ req }: { req: Request }) => ({
        req,
      }),
    }),

    HealthModule,
  ],
})
export class AppModule {}
