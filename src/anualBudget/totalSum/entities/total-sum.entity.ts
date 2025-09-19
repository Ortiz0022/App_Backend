import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { FiscalYear } from 'src/anualBudget/fiscalYear/entities/fiscal-year.entity';

@Entity({ name: 'total_sum' })
@Unique(['fiscalYear']) // un snapshot por año fiscal
export class TotalSum {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => FiscalYear, (fy) => fy.totals, { eager: true })
  fiscalYear: FiscalYear;

  @Column('decimal', { precision: 18, scale: 2, default: 0 })
  total_income: string;

  @Column('decimal', { precision: 18, scale: 2, default: 0 })
  total_spend: string;
}
