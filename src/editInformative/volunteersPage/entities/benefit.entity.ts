import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { VolunteersPage } from "./volunteers-page.entity";


@Entity({ name: 'volunteers_benefit' })
export class Benefit {
  @PrimaryGeneratedColumn()
  id: string;

  // Usa el nombre del ícono (ej: 'Users', 'Heart', 'Award') para mapear en el front a lucide-react
  @Column({ type: 'nvarchar', length: 50 })
  iconName: string;

  @Column({ type: 'nvarchar', length: 120 })
  title: string;

  @Column({ type: 'nvarchar', length: 1000 })
  desc: string;

  @Column({ type: 'int', default: 0 })
  order: number;

  @ManyToOne(() => VolunteersPage, (p) => p.benefits, { onDelete: 'CASCADE' })
  page: VolunteersPage;
}