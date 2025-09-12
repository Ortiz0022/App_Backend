import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateSpendTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsNumber()
  amountSpend?: number;
}
