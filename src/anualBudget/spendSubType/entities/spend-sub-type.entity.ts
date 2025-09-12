// src/spendType/entities/spend-subtype.entity.ts
import { SpendType } from 'src/anualBudget/spendType/entities/spend-type.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';


@Entity()
export class SpendSubType {
  @PrimaryGeneratedColumn()
  id_SpendSubType: number;

  @Column({ length: 50 })
  name: string;

  @Column({ type: 'double precision' })
  amount: number;

  @Column({ type: 'datetime' })
  date: Date;

  @ManyToOne(() => SpendType, (type) => type.spendSubTypes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_SpendType' }) // 👈 FK con tu nombre
  spendType: SpendType;
}
