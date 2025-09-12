export class CreateIncomeTypeDto {
  name: string;
  departmentId?: number; 
  fiscalYearId?: number; // si no viene, se usa el FY activo
}
