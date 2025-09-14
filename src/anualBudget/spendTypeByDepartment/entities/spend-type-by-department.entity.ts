import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Department } from 'src/anualBudget/department/entities/department.entity';
import { FiscalYear } from 'src/anualBudget/fiscalYear/entities/fiscal-year.entity';

@Entity({ name: 'spend_type_by_department' })
@Unique(['department', 'fiscalYear']) // snapshot único por (departamento, año)
export class SpendTypeByDepartment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Department, (d) => d.id, { eager: true })
  department: Department;

  @ManyToOne(() => FiscalYear, (fy) => fy.id, { eager: true })
  fiscalYear: FiscalYear;

  // total de EGRESOS del departamento en ese año fiscal
  @Column('decimal', { precision: 18, scale: 2, default: 0 })
  amountDepSpend: string;
}
