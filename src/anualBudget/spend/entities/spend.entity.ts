import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { SpendSubType } from 'src/anualBudget/spendSubType/entities/spend-sub-type.entity';
import { FiscalYear } from 'src/anualBudget/fiscalYear/entities/fiscal-year.entity';

@Entity({ name: 'spend' })
export class Spend {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => SpendSubType, (s) => s.spends, { eager: true })
  spendSubType: SpendSubType;

  @Column('decimal', { precision: 18, scale: 2 })
  amount: string; // TypeORM devuelve decimal como string

  @Column({ type: 'date' })
  date: string;

  @ManyToOne(() => FiscalYear, { eager: true, onDelete: 'RESTRICT', nullable: true })
  fiscalYear?: FiscalYear;

}
