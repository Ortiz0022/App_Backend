// src/anualBudget/incomeType/dto/createIncomeTypeDto.ts
import { IsInt, IsNotEmpty } from 'class-validator';
export class CreatePIncomeTypeDto {
  @IsNotEmpty() name: string;
  @IsInt() departmentId: number;
}
