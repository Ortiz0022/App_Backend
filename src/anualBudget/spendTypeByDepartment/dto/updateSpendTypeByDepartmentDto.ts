// src/anualBudget/spendTypeByDepartment/dto/create-spend-type-by-department.dto.ts
import { IsNumber } from 'class-validator';

export class UpdateSpendTypeByDepartmentDto {
  @IsNumber()
  id_Department: number;
}
