// src/anualBudget/pSpendType/dto/update.dto.ts
import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdatePSpendTypeDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsInt() departmentId?: number;
}
