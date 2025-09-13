import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

export class UpdateExtraordinaryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount?: number;

  @IsDateString()
  date?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  used?: number;
}
