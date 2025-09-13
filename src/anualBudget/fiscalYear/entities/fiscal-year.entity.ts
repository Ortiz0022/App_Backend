// src/anualBudget/fiscalYear/entities/fiscal-year.entity.ts
import { IncomeTypeByDepartment } from 'src/anualBudget/incomeTypeByDeparment/entities/income-type-by-department.entity';
import { TotalSum } from 'src/anualBudget/totalSum/entities/total-sum.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';


export enum FiscalState { OPEN = 'OPEN', CLOSED = 'CLOSED' }

@Entity({ name: 'fiscal_year' })
export class FiscalYear {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', unique: true })
  year: number;

  @Column({ type: 'date' })
  start_date: string;

  @Column({ type: 'date' })
  end_date: string;

  @Column({ type: 'enum', enum: FiscalState, default: FiscalState.OPEN })
  state: FiscalState;

  @Column({ type: 'boolean', default: false })
  is_active: boolean;

  @OneToMany(() => TotalSum, (t) => t.fiscalYear)
  totals: TotalSum[];

  @OneToMany(() => IncomeTypeByDepartment, (itbd) => itbd.fiscalYear)
  deptTotals: IncomeTypeByDepartment[];
}
