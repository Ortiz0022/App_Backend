import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { PSpendType } from 'src/anualBudget/pSpendType/entities/p-spend-type.entity';
import { Department } from 'src/anualBudget/department/entities/department.entity';
import { FiscalYear } from 'src/anualBudget/fiscalYear/entities/fiscal-year.entity';

@Entity({ name: 'p_spend_type_by_department' })
@Unique(['department', 'fiscalYear'])
export class PSpendTypeByDepartment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  amountDepPSpend: number;

  @ManyToOne(() => Department, (d) => d.pSpendTotals, {
    eager: true,
    onDelete: 'CASCADE',
  })
  department: Department;

  @ManyToOne(() => FiscalYear, {
    eager: true,
    onDelete: 'CASCADE',
  })
  fiscalYear: FiscalYear;

  @OneToMany(() => PSpendType, (t) => t.byDepartment, { cascade: true })
  pSpendTypes: PSpendType[];
}