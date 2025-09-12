export class CreateIncomeSubTypeDto {
  name: string;
  amount: string;       // "12345.67"
  date?: string;        // ISO string; si no viene -> now()
  incomeTypeId: number; // FK
}
