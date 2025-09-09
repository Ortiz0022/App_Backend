import { IsDecimal, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateExtraordinaryDto {
  @IsNotEmpty()
  @IsDecimal()
  extraordinaryAmount!: string; // "9999.99"

  @IsOptional()
  @IsString()
  @MaxLength(150)
  description?: string;
}