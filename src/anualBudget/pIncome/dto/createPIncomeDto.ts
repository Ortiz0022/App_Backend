import { IsInt, IsNotEmpty } from 'class-validator';

export class CreatePIncomeDto {
  @IsInt() incomeSubTypeId: number;
  @IsNotEmpty() amount: string; 
}