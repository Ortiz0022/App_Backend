import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { VolunteersPage } from "./volunteers-page.entity";

@Entity({ name: 'volunteers_requirement' })
export class Requirement {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: 'nvarchar', length: 1000 })
  text: string;

  @Column({ type: 'int', default: 0 })
  order: number;

  @ManyToOne(() => VolunteersPage, (p) => p.requirements, { onDelete: 'CASCADE' })
  page: VolunteersPage;
}