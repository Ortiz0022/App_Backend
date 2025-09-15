// src/transfer/entities/transfer.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IncomeSubType } from 'src/anualBudget/incomeSubType/entities/income-sub-type.entity';
import { SpendSubType } from 'src/anualBudget/spendSubType/entities/spend-sub-type.entity';

@Entity('transfer')
export class Transfer {
  @PrimaryGeneratedColumn({ name: 'id_Transfer' })
  id: number;

  // Etiqueta breve opcional (ej: "Traspaso a Mantenimiento")
  @Column({ name: 'name', type: 'varchar', length: 50, nullable: true })
  name: string | null;

  // Nota / descripción opcional
  @Column({ name: 'detail', type: 'varchar', length: 255, nullable: true })
  detail: string | null;

  // Fecha del movimiento (si no envías, se toma createdAt)
  @Column({ name: 'date', type: 'date', nullable: true })
  date: string | null;

  // Monto transferido
  @Column({ name: 'transferAmount', type: 'decimal', precision: 14, scale: 2 })
  transferAmount: string;

  // Desde qué Subtipo de Ingreso sale el dinero
  @ManyToOne(() => IncomeSubType, { eager: true })
  fromIncomeSubType: IncomeSubType;

  // Hacia qué Subtipo de Egreso entra el dinero
  @ManyToOne(() => SpendSubType, { eager: true })
  toSpendSubType: SpendSubType;

  @CreateDateColumn({ name: 'createdAt', type: 'datetime' })
  createdAt: Date;
}
