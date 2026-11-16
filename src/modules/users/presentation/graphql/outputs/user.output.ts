import { Field, GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql';

import { User } from '../../../domain/entities/user.entity.js';

@ObjectType('User')
export class UserOutput {
  @Field(() => ID)
  id!: string;

  @Field()
  email!: string;

  @Field()
  username!: string;

  @Field()
  displayName!: string;

  @Field(() => String, { nullable: true })
  bio!: string | null;

  @Field(() => String, { nullable: true })
  avatarUrl!: string | null;

  @Field(() => GraphQLISODateTime)
  createdAt!: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt!: Date;

  static fromDomain(user: User): UserOutput {
    const output = new UserOutput();

    output.id = user.id;
    output.email = user.email.value;
    output.username = user.username.value;
    output.displayName = user.displayName;
    output.bio = user.bio;
    output.avatarUrl = user.avatarUrl;
    output.createdAt = user.createdAt;
    output.updatedAt = user.updatedAt;

    return output;
  }
}
