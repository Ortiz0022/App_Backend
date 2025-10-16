import {
  IsString,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class UpdateRazonSocialDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  razonSocial?: string;
}