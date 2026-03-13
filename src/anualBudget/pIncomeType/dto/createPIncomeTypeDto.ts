// src/anualBudget/incomeType/dto/createIncomeTypeDto.ts
import { IsInt, IsNotEmpty, IsString } from 'class-validator';
export class CreatePIncomeTypeDto {
  @IsNotEmpty() 
  @IsString()
  name: string;
  @IsInt()
  departmentId: number;
}
