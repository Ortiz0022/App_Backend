export class CreateSpendDto {
  spendSubTypeId: number;
  amount: string;   // mantener string para consistencia con decimal
  date: string;     // 'YYYY-MM-DD'
}
