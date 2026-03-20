import { FiscalYear } from 'src/anualBudget/fiscalYear/entities/fiscal-year.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity({ name: 'extraordinary' })
export class Extraordinary {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column('decimal', { precision: 18, scale: 2 })
  amount: string;

  @Column('decimal', { precision: 18, scale: 2, default: 0 })
  used: string;

  @Column({ type: 'date', nullable: true })
  date?: string | null;

  @ManyToOne(() => FiscalYear, {
    eager: true,
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'fiscalYearId' })
  fiscalYear: FiscalYear | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}