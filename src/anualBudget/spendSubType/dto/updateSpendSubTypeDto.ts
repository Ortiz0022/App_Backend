import { IsInt, IsOptional, IsString } from "class-validator";

export class UpdateSpendSubTypeDto {
  @IsOptional()
  @IsString()
  name?: string;
  @IsOptional()
  @IsInt()
  spendTypeId?: number;
}
