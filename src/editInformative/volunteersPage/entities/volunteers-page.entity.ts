import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Requirement } from "./requirement.entity";
import { Benefit } from './benefit.entity';


@Entity({ name: 'volunteers_page' })
export class VolunteersPage {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: 'nvarchar', length: 200 })
  headerTitle: string;

  @Column({ type: 'nvarchar', length: 2000 })
  headerDescription: string;

  @OneToMany(() => Benefit, (b) => b.page, { cascade: true, eager: true })
  benefits: Benefit[];

  @OneToMany(() => Requirement, (r) => r.page, { cascade: true, eager: true })
  requirements: Requirement[];
}