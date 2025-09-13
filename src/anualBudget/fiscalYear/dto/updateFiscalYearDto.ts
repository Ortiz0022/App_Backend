// src/anualBudget/fiscalYear/dto/updateFiscalYearDto.ts
import { IsDateString, IsEnum, IsInt, IsOptional } from 'class-validator';
import { FiscalState } from '../entities/fiscal-year.entity';
export class UpdateFiscalYearDto {
  @IsOptional() @IsInt() year?: number;
  @IsOptional() @IsDateString() start_date?: string;
  @IsOptional() @IsDateString() end_date?: string;
  @IsOptional() @IsEnum(FiscalState) state?: FiscalState;
  @IsOptional() is_active?: boolean;
}
