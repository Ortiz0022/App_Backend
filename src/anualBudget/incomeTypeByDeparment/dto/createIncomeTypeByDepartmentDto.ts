import { IsInt, IsOptional, IsString } from "class-validator";

export class CreateIncomeTypeByDepartmentDto {
  @IsInt()
  departmentId: number;
  @IsInt()
  incomeTypeId: number;
  // opcional: si quieres setear manualmente al crear (normalmente se recalcula a 0)
  @IsString()
  @IsOptional()
  amountDepIncome?: string;
}
