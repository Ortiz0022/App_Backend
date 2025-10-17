import {
  IsString,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class UpdateAreaInteresDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nombreArea?: string;
}