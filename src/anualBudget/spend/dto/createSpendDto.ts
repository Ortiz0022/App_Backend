import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsNotEmpty, IsNumberString } from 'class-validator';

export class CreateSpendDto {
  @Type(() => Number)
  @IsInt()
  spendSubTypeId: number;

  @IsNotEmpty()
  @IsNumberString()
  amount: string;

  @IsNotEmpty()
  @IsDateString()
  date: string;
}