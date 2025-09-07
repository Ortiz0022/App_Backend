import { Budget } from 'src/anualBudget/budget/entities/budget.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';


@Entity({ name: 'categories' })
@Unique(['name', 'budget']) // evita nombres repetidos dentro del mismo presupuesto
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 120 })
  name: string;

  @Column({ length: 255, nullable: true })
  description?: string;

  // guardado en BD; inicia en 0.00
  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  category_amount: string;

  @ManyToOne(() => Budget, (b) => b.categories, { nullable: false, onDelete: 'CASCADE' })
  budget: Budget;
}
