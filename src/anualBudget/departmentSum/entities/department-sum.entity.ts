import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { FiscalYear } from '../../fiscalYear/entities/fiscal-year.entity';

@Entity({ name: 'department_sums' })
@Unique(['fiscalYear']) // un snapshot por año fiscal
export class DepartmentSum {
  @PrimaryGeneratedColumn()
  id: number;
  
  @ManyToOne(() => FiscalYear, { eager: true })
  @JoinColumn({ name: 'fiscalYearId' }) // FK por convención de TypeORM
  fiscalYear: FiscalYear;

  @Column('decimal', { precision: 18, scale: 2, default: 0 })
  totalIncome: string;

  @Column('decimal', { precision: 18, scale: 2, default: 0 })
  totalSpend: string;

}
