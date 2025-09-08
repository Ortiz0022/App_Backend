
import { IsEnum, IsInt, Min, IsOptional } from 'class-validator';
import { FiscalStatus } from '../entities/fiscal-year.entity';

export class CreateFiscalYearDto {
  @IsInt() @Min(2000)
  year: number;

  @IsOptional() @IsEnum(FiscalStatus)
  status?: FiscalStatus;
}
