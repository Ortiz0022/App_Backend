// src/transfer/dto/filter-transfer.dto.ts
import { IsDateString, IsInt, IsOptional } from 'class-validator';

export class FilterTransferDto {
  @IsOptional() @IsInt()
  id_FromIncomeType?: number;

  @IsOptional() @IsInt()
  id_ToSpendType?: number;

  @IsOptional() @IsDateString()
  fromDate?: string;

  @IsOptional() @IsDateString()
  toDate?: string;
}
