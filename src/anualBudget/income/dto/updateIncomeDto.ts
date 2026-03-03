
import { IsDateString, IsInt, IsOptional, IsNumberString } from 'class-validator';

export class UpdateIncomeDto {
  @IsOptional() @IsInt() incomeSubTypeId?: number;

  @IsOptional() @IsNumberString()
  amount?: string;

  @IsOptional() @IsDateString()
  date?: string;
}
