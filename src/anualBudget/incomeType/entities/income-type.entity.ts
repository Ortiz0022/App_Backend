import { Department } from 'src/anualBudget/department/entities/department.entity';
import { IncomeSubType } from 'src/anualBudget/incomeSubType/entities/income-sub-type.entity';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';


@Entity({ name: 'income_types' })
@Unique(['name'])
export class IncomeType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  name: string;

  // total del tipo = suma de sus subtipos (movimientos)
  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  amountIncome: string;

  @OneToMany(() => IncomeSubType, (s) => s.incomeType)
  subTypes: IncomeSubType[];

@ManyToOne(() => Department, d => d.incomeTypes, { eager: true })
  department: Department;
}
