import { IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateIncomeTypeByDepartmentDto {
    // normalmente solo tocarías el acumulado (si tu flujo lo permite)
    @IsString()
    @IsOptional()
    amountDepPIncome?: string;
  // si quieres permitir mover el vínculo, déjalos opcionales:
  @IsNumber()
  @IsOptional()
  departmentId?: number;
  @IsNumber()
  @IsOptional()
  pIncomeTypeId?: number;
}
