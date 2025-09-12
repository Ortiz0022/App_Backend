import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, MaxLength, IsNumber } from 'class-validator';

export class CreateTransferDto {
  @IsString() @IsNotEmpty() @MaxLength(50)
  name: string;

  @IsOptional() @IsDateString()
  date?: string;

  @IsOptional() @IsString() @MaxLength(255)
  detail?: string;
  
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  transferAmount: number;

  @IsInt()
  id_FromIncomeType: number;

  @IsInt()
  id_ToSpendType: number;
}

