import { IsInt, IsOptional, IsString } from "class-validator";

export class UpdateSpendTypeDto {
  @IsOptional()
  @IsString()
  name?: string;
  @IsOptional()
  @IsInt()
  departmentId?: number;
}
