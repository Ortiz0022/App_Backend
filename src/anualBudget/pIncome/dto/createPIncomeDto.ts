import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreatePIncomeDto {
  @IsInt() pIncomeSubTypeId: number;
  @IsNotEmpty() 
  @IsString()
  amount: string; 
}