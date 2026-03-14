import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreatePIncomeTypeByDepartmentDto {
  @IsNumber()
    departmentId: number;
  @IsNumber()
    pIncomeTypeId: number;
    // opcional: si quieres setear manualmente al crear (normalmente se recalcula a 0)
  @IsString()
  @IsOptional()
    amountDepPIncome?: string;
  }
  