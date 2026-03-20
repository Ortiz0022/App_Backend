import { IsInt, IsNotEmpty } from "class-validator";

export class CreateSpendSubTypeDto {
  @IsNotEmpty()
  name: string;
  @IsInt()
  spendTypeId: number;
}
