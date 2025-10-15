// src/anualBudget/pSpend/dto/create.dto.ts
import { IsDateString, IsInt, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreatePSpendDto {
  @IsNumber() amount: number;
  @IsInt() subTypeId: number;
   @IsOptional()
  @IsDateString()
  date?: string; 
}
