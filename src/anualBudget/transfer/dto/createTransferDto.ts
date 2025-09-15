// src/transfer/dto/create-transfer.dto.ts
import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

export class CreateTransferDto {
  @IsInt()
  incomeSubTypeId: number;

  @IsInt()
  spendSubTypeId: number;

  @IsPositive()
  @IsNotEmpty()
  amount: string;

  @IsOptional()
  @IsString()
  date?: string; // yyyy-mm-dd

  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  detail?: string;
}
