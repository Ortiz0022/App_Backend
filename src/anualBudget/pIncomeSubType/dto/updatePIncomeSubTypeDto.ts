import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdatePIncomeSubTypeDto {
  @IsInt() @IsOptional() pIncomeTypeId?: number;
  @IsString() @IsOptional() name?: string;
}