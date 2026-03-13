// src/anualBudget/incomeSubType/dto/createIncomeSubTypeDto.ts
import { IsInt, IsNotEmpty, IsString } from 'class-validator';
export class CreateIncomeSubTypeDto {
  @IsNotEmpty() 
  @IsString()
  name: string;

  @IsInt() 
  incomeTypeId: number;
}
