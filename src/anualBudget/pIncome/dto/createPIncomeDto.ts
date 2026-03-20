import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePIncomeDto {
  @IsInt()
  pIncomeSubTypeId: number;

  @IsNotEmpty()
  @IsString()
  amount: string;

  @IsOptional()
  @IsInt()
  fiscalYearId?: number;
}