// src/anualBudget/category/entities/category.entity.ts
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Projection } from '../../projection/entities/projection.entity';

@Entity({ name: 'categories' })
@Unique(['name', 'projection'])
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 120 })
  name: string;

  @Column({ length: 255, nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  category_amount: string;

  @ManyToOne(() => Projection, (p: Projection) => p.categories, { nullable: false, onDelete: 'CASCADE' })
  projection: Projection; // ✅ FK será projectionId
}
