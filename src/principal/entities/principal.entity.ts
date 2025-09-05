import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { Event } from 'src/event/entities/event.entity';

@Entity()
export class Principal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false })
  description: string;

  @OneToOne(() => Event, (event) => event.principal, { eager: true, nullable: true })
  @JoinColumn()
  event: Event;
}