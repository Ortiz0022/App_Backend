import { IsDateString, IsInt, IsNotEmpty, IsNumberString, IsOptional } from 'class-validator';

export class CreateIncomeDto {
  @IsInt()
  incomeSubTypeId: number;

  @IsNotEmpty()
  @IsNumberString()
  amount: string;

  @IsDateString()
  @IsOptional()
  date: string;
}
