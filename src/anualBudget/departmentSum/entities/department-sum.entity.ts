import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { FiscalYear } from '../../fiscalYear/entities/fiscal-year.entity';
import { Department } from 'src/anualBudget/department/entities/department.entity';

@Entity({ name: 'department_sums' })
@Unique(['fiscalYear']) // un snapshot por año fiscal
export class DepartmentSum {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Department, { eager: true })
  department: Department;

  // ¡FiscalYear SOLO se usa aquí!
  @ManyToOne(() => FiscalYear, { eager: true })
  fiscalYear: FiscalYear;

  @Column('decimal', { precision: 18, scale: 2, default: 0 })
  totalIncome: string;

//   @Column('decimal', { precision: 18, scale: 2, default: 0 })
//   totalSpend: string;

}
