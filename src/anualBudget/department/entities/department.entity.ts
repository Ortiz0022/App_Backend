// src/anualBudget/department/entities/department.entity.ts
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { IncomeType } from 'src/anualBudget/incomeType/entities/income-type.entity';
import { IncomeTypeByDepartment } from 'src/anualBudget/incomeTypeByDeparment/entities/income-type-by-department.entity';
import { SpendType } from 'src/anualBudget/spendType/entities/spend-type.entity';
import { SpendTypeByDepartment } from 'src/anualBudget/spendTypeByDepartment/entities/spend-type-by-department.entity';

@Entity({ name: 'department' })
export class Department {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @OneToMany(() => IncomeType, (it) => it.department)
  incomeTypes: IncomeType[];

  @OneToMany(() => IncomeTypeByDepartment, (itbd) => itbd.department)
  totals: IncomeTypeByDepartment[];



   @OneToMany(() => SpendType, (st) => st.department)
  spendTypes: SpendType[];

  @OneToMany(() => SpendTypeByDepartment, (stbd) => stbd.department)
  spendTotals: SpendTypeByDepartment[];
}
