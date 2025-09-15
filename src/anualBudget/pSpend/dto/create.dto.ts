// src/anualBudget/pSpend/dto/create.dto.ts
import { IsInt, IsNotEmpty, IsNumber } from 'class-validator';

export class CreatePSpendDto {
  @IsNumber() amount: number;
  @IsInt() subTypeId: number;
  @IsInt() fiscalYearId: number;
}
