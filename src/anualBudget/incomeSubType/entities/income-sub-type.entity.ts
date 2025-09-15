// src/anualBudget/incomeSubType/entities/income-sub-type.entity.ts
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { IncomeType } from 'src/anualBudget/incomeType/entities/income-type.entity';
import { Income } from 'src/anualBudget/income/entities/income.entity';


@Entity({ name: 'income_sub_type' })
export class IncomeSubType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 120 })
  name: string;

  @ManyToOne(() => IncomeType, (it) => it.subTypes, { eager: true })
  incomeType: IncomeType;

  @OneToMany(() => Income, (inc) => inc.incomeSubType)
  incomes: Income[];
    pIncomes: any;
}
