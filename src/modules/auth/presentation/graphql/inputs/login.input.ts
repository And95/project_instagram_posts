import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class LoginGraphqlInput {
  @Field()
  email!: string;

  @Field()
  password!: string;
}
