import { IsInt, IsNotEmpty, IsString, IsPositive } from 'class-validator';

export class CreatePIncomeDto {
  @IsInt()
  pIncomeSubTypeId: number;

  @IsNotEmpty()
  @IsString()
  amount: string;

  @IsInt()
  @IsPositive()
  fiscalYearId: number;
}