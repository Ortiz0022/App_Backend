import { IsInt, IsNotEmpty } from 'class-validator';

export class CreatePIncomeDto {
  @IsInt() pIncomeSubTypeId: number;
  @IsNotEmpty() amount: string; 
}