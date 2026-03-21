import {  IsInt, IsNumber, IsOptional, IsPositive } from 'class-validator';

export class UpdatePSpendDto {
  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsInt()
  subTypeId?: number;

  @IsInt()
  @IsPositive()
  fiscalYearId: number;
}