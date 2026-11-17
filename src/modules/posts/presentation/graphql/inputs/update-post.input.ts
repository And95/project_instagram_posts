import { Field, InputType } from '@nestjs/graphql';
import {
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateIf,
} from 'class-validator';

@InputType()
export class UpdatePostGraphqlInput {
  @Field(() => String, { nullable: true })
  @ValidateIf((_object, value) => value !== undefined)
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  imageUrl?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(2200)
  caption?: string | null;
}
