export class UpdateIncomeTypeByDepartmentDto {
    // normalmente solo tocarías el acumulado (si tu flujo lo permite)
  amountDepPIncome?: string;
  // si quieres permitir mover el vínculo, déjalos opcionales:
  departmentId?: number;
  pIncomeTypeId?: number;
}
