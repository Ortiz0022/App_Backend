import { IsInt, IsOptional } from "class-validator";

export class UpdateIncomeTypeByDepartmentDto {
    // normalmente solo tocarías el acumulado (si tu flujo lo permite)
  @IsInt()
  @IsOptional()
  amountDepIncome?: string;
  // si quieres permitir mover el vínculo, déjalos opcionales:
  @IsInt()
  @IsOptional()
  departmentId?: number;
  @IsInt()
  @IsOptional()
  incomeTypeId?: number;
}
