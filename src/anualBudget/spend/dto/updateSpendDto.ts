import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsNumber, IsNumberString, IsOptional } from 'class-validator';

export class UpdateSpendDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  spendSubTypeId?: number;

  @IsOptional()
  @Type(() => String)
  @IsNumberString()
  amount?: string;

  @IsOptional()
  @IsDateString()
  date?: string;
}