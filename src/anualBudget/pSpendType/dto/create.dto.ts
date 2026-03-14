// src/anualBudget/pSpendType/dto/create.dto.ts
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreatePSpendTypeDto {
  @IsNotEmpty() @IsString() name: string;
  @IsInt() departmentId: number;
}
