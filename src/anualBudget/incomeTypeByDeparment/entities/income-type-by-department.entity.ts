import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Department } from '../../department/entities/department.entity';
import { IncomeType } from '../../incomeType/entities/income-type.entity';
import { FiscalYear } from '../../fiscalYear/entities/fiscal-year.entity';

@Entity({ name: 'income_type_by_department' })
@Unique([ 'department', 'incomeType'])
export class IncomeTypeByDepartment {
  @PrimaryGeneratedColumn()
  id: number;

  // Suma de amountIncome de TODOS los IncomeType ligados a (FY, Dept) para este tipo
  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  amountDepIncome: string;

  @ManyToOne(() => Department, { nullable: false, onDelete: 'CASCADE' })
  department: Department;

  @ManyToOne(() => IncomeType, { nullable: false, onDelete: 'RESTRICT' })
  incomeType: IncomeType;

}
