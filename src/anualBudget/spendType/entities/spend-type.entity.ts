// src/spendType/entities/spend-type.entity.ts
import { SpendSubType } from 'src/anualBudget/spendSubType/entities/spend-sub-type.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Department } from 'src/anualBudget/department/entities/department.entity';

@Entity()
export class SpendType {
  @PrimaryGeneratedColumn()
  id_SpendType: number;

  @Column({ length: 50 })
  name: string;

  // total = suma de todos los SpendSubType.amount
  @Column({ type: 'double precision', default: 0 })
  amountSpend: number;

  @OneToMany(() => SpendSubType, (sub) => sub.spendType, { cascade: false })
  spendSubTypes: SpendSubType[];

  @ManyToOne(() => Department, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_Department' }) // crea la columna exacta id_Department
  department: Department;
}
