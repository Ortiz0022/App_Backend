import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Department } from 'src/anualBudget/department/entities/department.entity';
import { PIncomeSubType } from 'src/anualBudget/pIncomeSubType/entities/pincome-sub-type.entity';

@Entity({ name: 'p_income_type' })
export class PIncomeType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 120 })
  name: string;

  @ManyToOne(() => Department, (d) => d.pIncomeTypes, { eager: true })
  department: Department;

  // SUM de sus subtypes
  @Column('decimal', { precision: 18, scale: 2, default: 0 })
  amountPIncome: string;

  @OneToMany(() => PIncomeSubType, (s) => s.pincomeType)
  subTypes: PIncomeSubType[];
}
