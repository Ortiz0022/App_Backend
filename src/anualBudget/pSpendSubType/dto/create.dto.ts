// src/anualBudget/pSpendSubType/dto/create.dto.ts
import { IsInt, IsNotEmpty } from 'class-validator';

export class CreatePSpendSubTypeDto {
  @IsNotEmpty() name: string;
  @IsInt() typeId: number; // FK -> PSpendType
}
