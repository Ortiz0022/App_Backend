import { PIncomeSubType } from 'src/anualBudget/pIncomeSubType/entities/pincome-sub-type.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'p_income' })
export class PIncome {  
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => PIncomeSubType, (s) => s.pIncomes, { eager: true })
  pIncomeSubType: PIncomeSubType;

  @Column('decimal', { precision: 18, scale: 2 })
  amount: string;

  @Column({ type: 'date', nullable: true })
  date: Date;
}
