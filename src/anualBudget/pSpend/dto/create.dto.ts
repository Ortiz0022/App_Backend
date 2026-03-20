import { IsDateString, IsInt, IsNumber, IsOptional } from 'class-validator';

export class CreatePSpendDto {
  @IsNumber()
  amount: number;

  @IsInt()
  subTypeId: number;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsInt()
  fiscalYearId?: number;
}