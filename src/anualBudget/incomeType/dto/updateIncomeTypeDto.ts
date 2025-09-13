// src/anualBudget/incomeType/dto/updateIncomeTypeDto.ts
import { IsInt, IsOptional, IsString } from 'class-validator';
export class UpdateIncomeTypeDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsInt() departmentId?: number;
}
