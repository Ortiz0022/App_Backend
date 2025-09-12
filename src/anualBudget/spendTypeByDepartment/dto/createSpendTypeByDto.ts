// src/anualBudget/spendTypeByDepartment/dto/create-spend-type-by-department.dto.ts
import { IsNumber } from 'class-validator';

export class CreateSpendTypeByDepartmentDto {
  @IsNumber()
  id_Department: number; // crea (o asegura) la fila TOTAL del departamento
}
