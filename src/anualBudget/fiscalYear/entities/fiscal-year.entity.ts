// src/anualBudget/fiscalYear/entities/fiscal-year.entity.ts
import { Projection } from 'src/anualBudget/projection/entities/projection.entity';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';

export enum FiscalStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  ARCHIVED = 'ARCHIVED',
}

@Entity({ name: 'fiscal_years' })
@Unique(['year']) // un ciclo por año
export class FiscalYear {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'enum', enum: FiscalStatus, default: FiscalStatus.OPEN })
  status: FiscalStatus;

  @OneToOne(() => Projection, (p) => p.fiscalYear)
  projection: Projection; // 1:1 opcional (se llena cuando exista proyección)
}
