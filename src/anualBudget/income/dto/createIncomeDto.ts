import { IsDateString, IsInt, IsNotEmpty, IsNumberString } from 'class-validator';

export class CreateIncomeDto {
  @IsInt()
  incomeSubTypeId: number;

  @IsNotEmpty()
  @IsNumberString()
  amount: string;

  @IsDateString()
  date: string;
}
