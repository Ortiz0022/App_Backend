// src/anualBudget/extraordinary/dto/assign-one.dto.ts
import { IsDecimal, IsInt, IsPositive } from 'class-validator';

export class AssignOneDto {
  @IsInt()
  @IsPositive()
  categoryId!: number;

  @IsDecimal()
  assigned_amount!: string; // "2000.00"
}
