import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PSpendSubType } from 'src/anualBudget/pSpendSubType/entities/p-spend-sub-type.entity';
import { FiscalYear } from 'src/anualBudget/fiscalYear/entities/fiscal-year.entity';

@Entity('p_spend')
export class PSpend {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { precision: 15, scale: 2 })
  amount: number;

  @ManyToOne(() => PSpendSubType, s => s.pSpends, { eager: true, onDelete: 'CASCADE' })
  subType: PSpendSubType;

  
  @Column({ type: 'date', nullable: true })
  date: Date;


  @ManyToOne(() => FiscalYear, { eager: true, onDelete: 'CASCADE' })
  fiscalYear: FiscalYear;


}
