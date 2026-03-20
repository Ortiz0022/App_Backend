import { IsNumber } from "class-validator";

export class CreatePSpendTypeByDepartmentDto {
  @IsNumber()
  amountDepPSpend: number;
  @IsNumber()
  departmentId: number; // FK Department
}
