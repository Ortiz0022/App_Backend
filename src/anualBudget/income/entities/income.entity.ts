// src/anualBudget/income/entities/income.entity.ts
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { IncomeSubType } from 'src/anualBudget/incomeSubType/entities/income-sub-type.entity';
import { FiscalYear } from 'src/anualBudget/fiscalYear/entities/fiscal-year.entity';

@Entity({ name: 'income' })
export class Income {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => IncomeSubType, (s) => s.incomes, { eager: true })
  incomeSubType: IncomeSubType;

  @Column('decimal', { precision: 18, scale: 2 })
  amount: string;

  @Column({ type: 'date' })
  date: string;

  @ManyToOne(() => FiscalYear, { eager: true, onDelete: 'RESTRICT', nullable: true })
  fiscalYear?: FiscalYear;
}
