import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateUserInputType {
  @Field()
  email!: string;

  @Field()
  username!: string;

  @Field()
  displayName!: string;

  @Field(() => String, { nullable: true })
  bio?: string | null;

  @Field(() => String, { nullable: true })
  avatarUrl?: string | null;
}
