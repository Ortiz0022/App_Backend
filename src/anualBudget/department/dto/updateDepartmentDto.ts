// src/anualBudget/department/dto/updateDepartmentDto.ts
import { IsOptional, MaxLength } from 'class-validator';
export class UpdateDepartmentDto {
  @IsOptional() @MaxLength(100) name?: string;
}
