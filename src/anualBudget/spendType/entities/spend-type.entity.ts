// src/spendType/entities/spend-type.entity.ts
import { SpendSubType } from 'src/anualBudget/spendSubType/entities/spend-sub-type.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';


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

  // @OneToMany(() => SpendTypeByDepartment, (std) => std.spendType, { cascade: false })
  // spendTypeByDepartments: SpendTypeByDepartment[];
}
