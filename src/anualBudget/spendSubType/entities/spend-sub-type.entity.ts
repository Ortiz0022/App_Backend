import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { SpendType } from 'src/anualBudget/spendType/entities/spend-type.entity';
import { Spend } from 'src/anualBudget/spend/entities/spend.entity';

@Entity({ name: 'spend_sub_type' })
export class SpendSubType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 120 })
  name: string;

  @ManyToOne(() => SpendType, (st) => st.subTypes, { eager: true })
  spendType: SpendType;

  @OneToMany(() => Spend, (sp) => sp.spendSubType)
  spends: Spend[];
}
