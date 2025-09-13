// src/anualBudget/incomeType/dto/createIncomeTypeDto.ts
import { IsInt, IsNotEmpty } from 'class-validator';
export class CreateIncomeTypeDto {
  @IsNotEmpty() name: string;
  @IsInt() departmentId: number;
}
