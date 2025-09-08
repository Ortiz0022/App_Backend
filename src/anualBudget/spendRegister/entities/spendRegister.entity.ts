import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Category } from '../../category/entities/category.entity';

@Entity({ name: 'spend_registers' })
export class SpendRegister {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'datetime' })
  date: Date;

  @Column({ length: 250, nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  sub_total: string;

  @Column({ length: 250, nullable: true })
  voucher?: string;

  @ManyToOne(() => Category, (c: Category) => c.id, { nullable: false, onDelete: 'CASCADE' })
  category: Category; // FK: categoryId
}
