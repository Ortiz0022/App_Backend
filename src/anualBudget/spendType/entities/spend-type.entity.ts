import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Department } from 'src/anualBudget/department/entities/department.entity';
import { SpendSubType } from 'src/anualBudget/spendSubType/entities/spend-sub-type.entity';

@Entity({ name: 'spend_type' })
export class SpendType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 120 })
  name: string;

  @ManyToOne(() => Department, (d) => d.id, { eager: true })
  department: Department;

  // Suma de los subtotales de sus subtipos
  @Column('decimal', { precision: 18, scale: 2, default: 0 })
  amountSpend: string;

  @OneToMany(() => SpendSubType, (s) => s.spendType)
  subTypes: SpendSubType[];
}
