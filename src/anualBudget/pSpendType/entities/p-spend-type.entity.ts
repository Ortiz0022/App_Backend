// src/anualBudget/pSpendType/entities/p-spend-type.entity.ts
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PSpendTypeByDepartment } from 'src/anualBudget/pSpendTypeByDepartment/entities/p-spend-type-by-department.entity';
import { PSpendSubType } from 'src/anualBudget/pSpendSubType/entities/p-spend-sub-type.entity';
import { Department } from 'src/anualBudget/department/entities/department.entity';

@Entity({ name: 'p_spend_type' })
export class PSpendType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 120 })
  name: string;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  amountPSpend: number; // lo dejamos, pero NO se envía en create

  @ManyToOne(() => Department, (d) => d.pSpendTypes, { onDelete: 'CASCADE' })
  department: Department;

  // 👉 OPCIONAL en este flujo
  @ManyToOne(() => PSpendTypeByDepartment, (bd) => bd.pSpendTypes, {
    eager: true,
    nullable: true,
    onDelete: 'SET NULL',
  })
  byDepartment?: PSpendTypeByDepartment | null;

  @OneToMany(() => PSpendSubType, (s) => s.type, { cascade: true })
  subTypes: PSpendSubType[];
}
