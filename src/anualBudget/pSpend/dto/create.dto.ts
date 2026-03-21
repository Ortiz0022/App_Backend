import { IsInt, IsNumber, IsPositive } from 'class-validator';

export class CreatePSpendDto {
  @IsNumber()
  amount: number;

  @IsInt()
  subTypeId: number;

  @IsInt()
  @IsPositive()
  fiscalYearId: number;
}