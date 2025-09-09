// src/anualBudget/assing/entities/assing.entity.ts
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Category } from '../../category/entities/category.entity';
import { Extraordinary } from 'src/anualBudget/extraordinary/entities/extraordinary.entity';

@Entity({ name: 'Assing' })
@Unique(['extraordinaryBudget', 'category'])
export class AssignBudget {
  @PrimaryGeneratedColumn({ name: 'id_AssingBudget' })
  id: number;

  @Column({
    name: 'assigned_amount',
    type: 'decimal',
    precision: 14,
    scale: 2,
    default: 0,
  })
  assignedAmount: string;

  @ManyToOne(() => Category, { nullable: false, onDelete: 'RESTRICT' })
  category: Category;

 // src/anualBudget/assing/entities/assing.entity.ts
    @ManyToOne(() => Extraordinary, (e) => e.assignments, {
      nullable: false,
      onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'id_ExtraordinaryBudget' }) // <- fuerza nombre FK
    extraordinaryBudget: Extraordinary;

}
