import {
  IsOptional,
  IsString,
  IsDateString,
  IsNumberString,
  MaxLength,
  IsInt,
  IsPositive,
} from 'class-validator';

export class UpdateExtraordinaryDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsNumberString()
  amount?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsInt()
  @IsPositive()
  fiscalYearId: number;
}