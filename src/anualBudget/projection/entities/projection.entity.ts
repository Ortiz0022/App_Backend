// src/anualBudget/projection/entities/projection.entity.ts
import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn, Unique, JoinColumn } from 'typeorm';
import { Category } from 'src/anualBudget/category/entities/category.entity';
import { FiscalYear } from '../../fiscalYear/entities/fiscal-year.entity';

@Entity({ name: 'projections' })
@Unique(['fiscalYear']) // una proyección por año
export class Projection {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => FiscalYear, (fy) => fy.projection, { eager: true, nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fiscalYearId' })
  fiscalYear: FiscalYear;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  total_amount: string;

  @OneToMany(() => Category, (c) => c.projection)
  categories: Category[];
}
