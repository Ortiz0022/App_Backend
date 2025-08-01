import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Faq {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  question: string;

  @Column({ nullable: false, type: 'text' })
  answer: string;
}
