import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class RegisterUserGraphqlInput {
  @Field()
  email!: string;

  @Field()
  username!: string;

  @Field()
  displayName!: string;

  @Field()
  password!: string;

  @Field({ nullable: true })
  bio?: string;

  @Field({ nullable: true })
  avatarUrl?: string;
}
