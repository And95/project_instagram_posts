import { Field, ObjectType } from '@nestjs/graphql';

import { AuthUserOutput } from './auth-user.output.js';

@ObjectType()
export class AuthPayloadOutput {
  @Field()
  accessToken!: string;

  @Field(() => AuthUserOutput)
  user!: AuthUserOutput;
}
