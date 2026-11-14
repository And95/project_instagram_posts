import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class HealthStatusOutput {
  @Field()
  status: string;

  @Field()
  service: string;

  @Field()
  timestamp: string;
}
