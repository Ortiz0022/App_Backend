// src/anualBudget/incomeTypeByDeparment/entities/income-type-by-department.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Department } from 'src/anualBudget/department/entities/department.entity';
import { IncomeType } from 'src/anualBudget/incomeType/entities/income-type.entity';

@Entity()
export class IncomeTypeByDepartment {
  @PrimaryGeneratedColumn()
  id_IncomeTypeByDepartment: number;

  // TOTAL del departamento en ingresos (suma de todos los IncomeType.amountIncome)
  @Column('decimal', { precision: 18, scale: 2, default: 0 })
  amountDepIncome: string;

  @ManyToOne(() => Department, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'Id_Department' })
  department: Department;

  // Para la fila de TOTAL dejamos esta FK en NULL
  @ManyToOne(() => IncomeType, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'Id_TypeIncome' })
  incomeType?: IncomeType | null;
}
