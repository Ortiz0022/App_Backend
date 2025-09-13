// src/anualBudget/income/dto/updateIncomeDto.ts
import { IsDateString, IsInt, IsOptional } from 'class-validator';
export class UpdateIncomeDto {
  @IsOptional() @IsInt() incomeSubTypeId?: number;
  @IsOptional() amount?: string;
  @IsOptional() @IsDateString() date?: string;
}
