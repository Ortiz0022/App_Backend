import { FiscalState } from '../entities/fiscal-year.entity';

export class CreateFiscalYearDto {
  year: number;
  start_date?: string;
  end_date?: string;
  state?: FiscalState;  // 'OPEN' | 'CLOSED'
  is_active?: boolean;
}
