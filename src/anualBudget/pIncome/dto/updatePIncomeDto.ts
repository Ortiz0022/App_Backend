import { IsInt, IsOptional } from 'class-validator';

export class UpdatePIncomeDto {
  @IsOptional() @IsInt() pIncomeSubTypeId?: number;
  @IsOptional() amount?: string;
}