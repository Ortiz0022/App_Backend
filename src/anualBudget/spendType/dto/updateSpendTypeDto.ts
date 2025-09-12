import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateSpendTypeDto {
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsNumber()
  amountSpend?: number;

  @IsNotEmpty()
  id_Department: number;
}
