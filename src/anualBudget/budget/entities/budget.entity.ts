import { Category } from 'src/anualBudget/category/entities/category.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';


export enum BudgetState {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

@Entity({ name: 'budgets' })
@Unique(['year']) // un presupuesto por año
export class Budget {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  year: number;

  // Por ahora se almacena (luego podrás recalcularlo con ingresos)
  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  total_amount: string;

  @Column({ type: 'enum', enum: BudgetState, default: BudgetState.OPEN })
  state: BudgetState;

  @OneToMany(() => Category, (c) => c.budget)
  categories: Category[];
}
