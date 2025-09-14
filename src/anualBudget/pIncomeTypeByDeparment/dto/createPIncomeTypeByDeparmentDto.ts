export class CreatePIncomeTypeByDepartmentDto {
    departmentId: number;
    pIncomeTypeId: number;
    // opcional: si quieres setear manualmente al crear (normalmente se recalcula a 0)
    amountDepPIncome?: string;
  }
  