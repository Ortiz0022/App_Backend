import {
  IsNotEmpty,
  IsString,
  MaxLength,
  IsOptional,
  IsDateString,
  IsNumberString,
  IsInt,
  IsPositive,
} from 'class-validator';

export class CreateExtraordinaryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @IsNumberString()
  amount: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsInt()
  @IsPositive()
  fiscalYearId: number;
}