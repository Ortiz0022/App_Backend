export interface Totals {
  incomes: number;
  spends: number;
  balance: number;
  projectedIncomes: number;
  projectedSpends: number;
  projectedBalance: number;
}

export type GroupBy = 'department' | 'type' | 'subtype';

export interface ComparisonRow {
  id: number;
  name: string;
  real: number;
  projected: number;
  diff: number; // real - projected
}
