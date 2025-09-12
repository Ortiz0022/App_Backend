// src/anualBudget/spendTypeByDepartment/entities/spend-type-by-department.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { SpendType } from 'src/anualBudget/spendType/entities/spend-type.entity';
import { Department } from 'src/anualBudget/department/entities/department.entity';

@Entity()
export class SpendTypeByDepartment {
  @PrimaryGeneratedColumn()
  id_SpendTypeByDepartment: number;

  // TOTAL del departamento (suma de todos los SpendType.amountSpend del depto)
  @Column({ type: 'double precision', default: 0 })
  amountDepSpend: number;

  // Departamento (obligatorio)
  @ManyToOne(() => Department, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'Id_Department' })
  department: Department;

  // FK opcional a SpendType (para compatibilidad). En la fila TOTAL debe ser NULL.
  @ManyToOne(() => SpendType, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'Id_TypeSpend' })
  spendType?: SpendType | null;
}
