import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

export enum FiscalState {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

@Entity({ name: 'fiscal_years' })
@Unique(['year'])
export class FiscalYear {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  year: number;                 // 2025, 2026, ...

  @Column({ type: 'date', nullable: true })
  start_date?: string;          // 'YYYY-MM-DD'

  @Column({ type: 'date', nullable: true })
  end_date?: string;            // 'YYYY-MM-DD'

  @Column({ type: 'enum', enum: FiscalState, default: FiscalState.OPEN })
  state: FiscalState;

  @Column({ default: true })
  is_active: boolean;
}
