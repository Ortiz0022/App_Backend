import { IsInt, IsNotEmpty, IsString } from "class-validator";

export class CreateSpendTypeDto {
  @IsNotEmpty()
  @IsString()
  name: string;
  @IsNotEmpty()
  @IsInt()
  departmentId: number;
}
