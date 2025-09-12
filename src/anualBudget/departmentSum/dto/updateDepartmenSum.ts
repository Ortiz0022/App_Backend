// src/anualBudget/departmentSum/dto/create-department-sum.dto.ts
import { IsNumber } from 'class-validator';

export class UpdateDepartmentSumDto {
  @IsNumber()
  fiscalYearId: number; // ID del año fiscal para el snapshot
}
