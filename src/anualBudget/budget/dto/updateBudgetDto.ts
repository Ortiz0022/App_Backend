
import { BudgetState } from "../entities/budget.entity";

export class UpdateBudgetDto {
  year?: number;
  total_amount?: string;     // "0.00"
  state?: BudgetState;       // 'OPEN' | 'CLOSED'
}
