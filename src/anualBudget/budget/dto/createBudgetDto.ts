import { IsEnum, IsInt, IsNumberString, IsOptional, Min } from 'class-validator';
import { BudgetState } from '../entities/budget.entity';


export class CreateBudgetDto {
  @IsInt()
  @Min(2000)
  year: number;

  // opcional; si no viene, queda en 0.00
  @IsOptional()
  @IsNumberString()
  total_amount?: string;

  @IsOptional()
  @IsEnum(BudgetState)
  state?: BudgetState;
}
