import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PSpendType } from 'src/anualBudget/pSpendType/entities/p-spend-type.entity';
import { Department } from 'src/anualBudget/department/entities/department.entity';

@Entity({ name: 'p_spend_type_by_department' })
export class PSpendTypeByDepartment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  amountDepPSpend: number;

  // ↔ Department.pSpendTotals  (¡¡usa este nombre, no pSpendTypeByDepartment!!)
  @ManyToOne(() => Department, (d) => d.pSpendTotals, {
    eager: true,
    onDelete: 'CASCADE',
  })
  department: Department;

  // ↔ PSpendType.byDepartment
  @OneToMany(() => PSpendType, (t) => t.byDepartment, { cascade: true })
  pSpendTypes: PSpendType[];
}
