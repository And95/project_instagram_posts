import { Module } from '@nestjs/common';

import { GetHealthUseCase } from './application/use-cases/get-health.use-case.js';
import { HealthResolver } from './presentation/graphql/health.resolver.js';

@Module({
  providers: [GetHealthUseCase, HealthResolver],
})
export class HealthModule {}
