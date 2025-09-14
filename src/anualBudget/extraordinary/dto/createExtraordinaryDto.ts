import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Max, MaxLength } from 'class-validator';

export class CreateExtraordinaryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Max(999_999_999_999_999.99)
  amount: number;

  @IsDateString()
  date?: string; // yyyy-mm-dd
}
