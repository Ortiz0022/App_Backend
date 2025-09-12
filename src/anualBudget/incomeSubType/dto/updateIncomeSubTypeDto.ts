import { IsOptional, IsString, IsNumberString } from 'class-validator';

export class UpdateIncomeSubTypeDto {
  @IsOptional() @IsString()
  name?: string;

  @IsOptional() @IsNumberString()
  amount?: string;

  @IsOptional() @IsString()
  date?: string;

  @IsOptional() @IsNumberString()
  incomeTypeId?: number;
}
