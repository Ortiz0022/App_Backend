import { Department } from 'src/anualBudget/department/entities/department.entity';
import { IncomeSubType } from 'src/anualBudget/incomeSubType/entities/income-sub-type.entity';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique, JoinColumn } from 'typeorm';

@Entity({ name: 'income_types' })
export class IncomeType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  name: string;

  // total del tipo = suma de sus subtipos
  @Column('decimal', { precision: 14, scale: 2, default: 0 })
  amountIncome: string;

  @OneToMany(() => IncomeSubType, (s) => s.incomeType)
  subTypes: IncomeSubType[];

  // obligatorio: cada tipo pertenece a un departamento
  @ManyToOne(() => Department, d => d.incomeTypes, { eager: true, nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_Department' }) // usa este nombre de columna en BD
  department: Department;
}
