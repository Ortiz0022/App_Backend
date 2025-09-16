import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PIncomeType } from 'src/anualBudget/pIncomeType/entities/pincome-type.entity';
import { PIncome } from 'src/anualBudget/pIncome/entities/pIncome.entity';

@Entity({ name: 'p_income_sub_type' })
export class PIncomeSubType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 120 })
  name: string;

  @ManyToOne(() => PIncomeType, (it) => it.subTypes, { eager: true })
  pIncomeType: PIncomeType;

  @OneToMany(() => PIncome, (inc) => inc.pIncomeSubType)
  pIncomes: PIncome[];
}
