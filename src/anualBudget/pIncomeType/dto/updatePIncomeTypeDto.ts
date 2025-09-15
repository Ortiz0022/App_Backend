import { IsInt, IsOptional, IsString } from 'class-validator';
export class UpdatePIncomeTypeDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsInt() departmentId?: number;
}