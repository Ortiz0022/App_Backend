// src/anualBudget/fiscalYear/dto/createFiscalYearDto.ts
import { IsDateString, IsEnum, IsInt, IsOptional } from 'class-validator';
import { FiscalState } from '../entities/fiscal-year.entity';
export class CreateFiscalYearDto {
  @IsInt() year: number;
  @IsDateString() start_date: string;
  @IsDateString() end_date: string;
  @IsOptional() @IsEnum(FiscalState) state?: FiscalState;
  @IsOptional() is_active?: boolean;
}
