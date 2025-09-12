import { FiscalState } from '../entities/fiscal-year.entity';

export class UpdateFiscalYearDto {
  year?: number;
  start_date?: string;
  end_date?: string;
  state?: FiscalState;
  is_active?: boolean;
}
