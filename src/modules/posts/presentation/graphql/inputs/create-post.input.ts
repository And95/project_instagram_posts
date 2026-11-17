import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

@InputType()
export class CreatePostGraphqlInput {
  @Field()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  imageUrl!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(2200)
  caption?: string | null;
}
