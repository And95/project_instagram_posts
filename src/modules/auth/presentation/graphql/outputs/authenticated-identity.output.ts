import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AuthenticatedIdentityOutput {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  email!: string;
}
