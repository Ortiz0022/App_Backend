import { IsNotEmpty, IsString, IsNumber, IsDateString } from 'class-validator';

export class CreateSpendSubTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  amount: number;

  @IsDateString()
  date: string;

  @IsNumber()
  id_SpendType: number;
}
