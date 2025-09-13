// src/anualBudget/totalSum/entities/total-sum.entity.ts
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { FiscalYear } from 'src/anualBudget/fiscalYear/entities/fiscal-year.entity';

@Entity({ name: 'total_sum' })
@Unique(['fiscalYear']) // snapshot global por año
export class TotalSum {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => FiscalYear, (fy) => fy.totals, { eager: true })
  fiscalYear: FiscalYear;

  // total GLOBAL del año (SUM de todos los movimientos)
  @Column('decimal', { precision: 18, scale: 2, default: 0 })
  total_income: string;
}
