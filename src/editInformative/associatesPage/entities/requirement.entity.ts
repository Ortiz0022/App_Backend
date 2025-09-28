import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AssociatesPage } from './associates-page.entity';

@Entity({ name: 'associates_requirement' })
export class Requirement {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: 'nvarchar', length: 1000 })
  text: string;

  @Column({ type: 'int', default: 0 })
  order: number;

  @ManyToOne(() => AssociatesPage, (p) => p.requirements, { onDelete: 'CASCADE' })
  page: AssociatesPage;
}
