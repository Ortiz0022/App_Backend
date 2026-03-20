import { IsNumber } from "class-validator";

export class UpdatePSpendTypeByDepartmentDto {
  @IsNumber()
  amountDepPSpend?: number;
  @IsNumber()
  departmentId?: number;
}
