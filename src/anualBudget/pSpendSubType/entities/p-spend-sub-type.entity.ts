import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PSpendType } from 'src/anualBudget/pSpendType/entities/p-spend-type.entity';
import { PSpend } from 'src/anualBudget/pSpend/entities/p-spend.entity';

@Entity({ name: 'p_spend_sub_type' })
export class PSpendSubType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 120 })
  name: string;

  // ↔ PSpendType.subTypes
  @ManyToOne(() => PSpendType, (t) => t.subTypes, {
    onDelete: 'CASCADE',
    eager: true,
  })
  type: PSpendType;

  // ↔ PSpend.subType
  @OneToMany(() => PSpend, (p) => p.subType, { cascade: true })
  pSpends: PSpend[];
}
