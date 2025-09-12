import { IsNotEmpty, IsString, IsNumber, IsDateString } from 'class-validator';

export class UpdateSpendSubTypeDto {
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsNumber()
  amount?: number;

  @IsDateString()
  date?: string;

  @IsNumber()
  id_SpendType?: number;
}
