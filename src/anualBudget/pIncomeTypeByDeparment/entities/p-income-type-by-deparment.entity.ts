// src/anualBudget/incomeTypeByDeparment/entities/income-type-by-department.entity.ts
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Department } from 'src/anualBudget/department/entities/department.entity';
import { FiscalYear } from 'src/anualBudget/fiscalYear/entities/fiscal-year.entity';

@Entity({ name: 'p_income_type_by_department' })
@Unique(['department', 'fiscalYear']) // total único por (departamento, año)
export class PIncomeTypeByDepartment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Department, (d) => d.totals, { eager: true })
  department: Department;

  @ManyToOne(() => FiscalYear, (fy) => fy.deptTotals, { eager: true })
  fiscalYear: FiscalYear;

  // total del DEPARTAMENTO en ese año fiscal
  @Column('decimal', { precision: 18, scale: 2, default: 0 })
  amountDepPIncome: string;
}
