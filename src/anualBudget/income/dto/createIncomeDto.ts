import { IsDateString, IsInt, IsNotEmpty } from 'class-validator';
export class CreateIncomeDto {
  @IsInt() 
  incomeSubTypeId: number;

  @IsNotEmpty() 
  amount: string; // decimal como string

  @IsDateString() 
  date: string;
}
