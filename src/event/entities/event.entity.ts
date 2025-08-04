import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false, type: 'date' })
  date: string;

  @Column({ nullable: false, type: 'text' })
  description: string;

  @Column({ nullable: false })
  illustration: string;
}
