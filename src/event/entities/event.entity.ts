import { Principal } from 'src/principal/entities/principal.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';

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

   @OneToOne(() => Principal, (principal) => principal.event)
  principal: Principal;
}
