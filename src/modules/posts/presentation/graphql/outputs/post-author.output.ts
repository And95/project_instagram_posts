import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PostAuthorOutput {
  @Field()
  id!: string;

  @Field()
  username!: string;

  @Field()
  displayName!: string;

  @Field(() => String, { nullable: true })
  avatarUrl!: string | null;
}
