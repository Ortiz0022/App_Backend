import { IsInt, IsOptional } from 'class-validator';

export class UpdatePIncomeDto {
  @IsOptional() @IsInt() incomeSubTypeId?: number;
  @IsOptional() amount?: string;
}