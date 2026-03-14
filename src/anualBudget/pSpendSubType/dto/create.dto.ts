// src/anualBudget/pSpendSubType/dto/create.dto.ts
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreatePSpendSubTypeDto {
  @IsNotEmpty() @IsString() name: string;
  @IsInt() typeId: number; // FK -> PSpendType
}
