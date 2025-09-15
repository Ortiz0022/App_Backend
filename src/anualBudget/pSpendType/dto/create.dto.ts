// src/anualBudget/pSpendType/dto/create.dto.ts
import { IsInt, IsNotEmpty } from 'class-validator';

export class CreatePSpendTypeDto {
  @IsNotEmpty() name: string;
  @IsInt() departmentId: number;
}
