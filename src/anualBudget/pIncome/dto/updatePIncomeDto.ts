import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdatePIncomeDto {
  @IsOptional() @IsInt() pIncomeSubTypeId?: number;
  @IsOptional() @IsString() amount?: string;
}