import { Field, ObjectType } from '@nestjs/graphql';

import { PostAuthorOutput } from './post-author.output.js';

@ObjectType()
export class PostOutput {
  @Field()
  id!: string;

  @Field()
  authorId!: string;

  @Field()
  imageUrl!: string;

  @Field(() => String, { nullable: true })
  caption!: string | null;

  @Field(() => PostAuthorOutput)
  author?: PostAuthorOutput;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}
