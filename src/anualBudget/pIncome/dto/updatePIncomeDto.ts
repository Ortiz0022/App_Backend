import { IsInt, IsOptional, IsString, IsPositive } from 'class-validator';

export class UpdatePIncomeDto {
  @IsOptional()
  @IsInt()
  pIncomeSubTypeId?: number;

  @IsOptional()
  @IsString()
  amount?: string;

  @IsInt()
  @IsPositive()
  fiscalYearId: number;
}