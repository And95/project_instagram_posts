import { Query, Resolver } from '@nestjs/graphql';

import { GetHealthUseCase } from '../../application/use-cases/get-health.use-case.js';
import { HealthStatusOutput } from './outputs/health-status.output.js';

@Resolver()
export class HealthResolver {
  constructor(private readonly getHealthUseCase: GetHealthUseCase) {}

  @Query(() => HealthStatusOutput, { name: 'health' })
  getHealth(): HealthStatusOutput {
    return this.getHealthUseCase.execute();
  }
}
