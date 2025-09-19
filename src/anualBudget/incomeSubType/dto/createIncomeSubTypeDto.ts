// src/anualBudget/incomeSubType/dto/createIncomeSubTypeDto.ts
import { IsInt, IsNotEmpty } from 'class-validator';
export class CreateIncomeSubTypeDto {
  @IsNotEmpty() 
  name: string;

  @IsInt() 
  incomeTypeId: number;
}
