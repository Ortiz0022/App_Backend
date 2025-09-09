import { IsDecimal, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateExtraordinaryDto {
  @IsOptional()
  @IsDecimal()
  extraordinaryAmount?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  description?: string;
}
