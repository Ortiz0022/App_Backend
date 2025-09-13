// src/anualBudget/department/dto/createDepartmentDto.ts
import { IsNotEmpty, MaxLength } from 'class-validator';
export class CreateDepartmentDto {
  @IsNotEmpty() @MaxLength(100) name: string;
}
