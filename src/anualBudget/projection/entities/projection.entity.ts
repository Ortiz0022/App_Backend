
import { Category } from 'src/anualBudget/category/entities/category.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';


export enum ProjectionState {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

@Entity({ name: 'projections' })
@Unique(['year']) // un presupuesto por año
export class Projection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  year: number;

  // Por ahora se almacena (luego podrás recalcularlo con ingresos)
  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  total_amount: string;

  @Column({ type: 'enum', enum: ProjectionState, default: ProjectionState.OPEN })
  state: ProjectionState;

  @OneToMany(() => Category, (c) => c.projection)
  categories: Category[];
}
