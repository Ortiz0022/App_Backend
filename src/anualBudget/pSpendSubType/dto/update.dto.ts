// src/anualBudget/pSpendSubType/dto/update.dto.ts
import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdatePSpendSubTypeDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsInt() typeId?: number;
}
