// src/transfer/entities/transfer.entity.ts
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('transfer')
export class Transfer {
  @PrimaryGeneratedColumn({ name: 'id_Transfer' })
  id: number;

  @Column({ name: 'name', type: 'varchar', length: 50 })
  name: string;

  // Fecha del movimiento (si no envías, se toma createdAt)
  @Column({ name: 'date', type: 'datetime', nullable: true })
  date: Date | null;

  // Nota/descripción
  @Column({ name: 'detail', type: 'varchar', length: 255, nullable: true })
  detail: string | null;

  // Tipo de transferencia (opcional, por si luego tienes otras)
  @Column({ name: 'type', type: 'varchar', length: 30, default: 'extra' })
  type: string;

  // Monto transferido
  @Column({ name: 'transferAmount', type: 'decimal', precision: 14, scale: 2 })
  transferAmount: string;

//   @ManyToOne(() => IncomeType, (i) => i.outgoingTransfers, { eager: true })
//   fromIncomeType: IncomeType;

//   @ManyToOne(() => SpendType, (s) => s.incomingTransfers, { eager: true })
//   toSpendType: SpendType;

  @CreateDateColumn({ name: 'createdAt', type: 'datetime' })
  createdAt: Date;
}
