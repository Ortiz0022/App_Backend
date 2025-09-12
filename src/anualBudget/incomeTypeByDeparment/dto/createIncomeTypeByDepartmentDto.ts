export class CreateIncomeTypeByDepartmentDto {
  departmentId: number;
  incomeTypeId: number;
  // opcional: si quieres setear manualmente al crear (normalmente se recalcula a 0)
  amountDepIncome?: string;
}
