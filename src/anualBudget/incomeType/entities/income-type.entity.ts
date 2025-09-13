// src/anualBudget/incomeType/entities/income-type.entity.ts
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Department } from 'src/anualBudget/department/entities/department.entity';
import { IncomeSubType } from 'src/anualBudget/incomeSubType/entities/income-sub-type.entity';

@Entity({ name: 'income_type' })
export class IncomeType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 120 })
  name: string;

  @ManyToOne(() => Department, (d) => d.incomeTypes, { eager: true })
  department: Department;

  // SUM de sus subtypes
  @Column('decimal', { precision: 18, scale: 2, default: 0 })
  amountIncome: string;

  @OneToMany(() => IncomeSubType, (s) => s.incomeType)
  subTypes: IncomeSubType[];
}
