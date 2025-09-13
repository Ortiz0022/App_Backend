// src/anualBudget/incomeSubType/dto/updateIncomeSubTypeDto.ts
import { IsInt, IsOptional, IsString } from 'class-validator';
export class UpdateIncomeSubTypeDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsInt() incomeTypeId?: number;
}
