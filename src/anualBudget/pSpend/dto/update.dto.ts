// src/anualBudget/pSpend/dto/update.dto.ts
import { IsInt, IsNumber, IsOptional } from 'class-validator';

export class UpdatePSpendDto {
  @IsOptional() @IsNumber() amount?: number;
  @IsOptional() @IsInt() subTypeId?: number;
}
