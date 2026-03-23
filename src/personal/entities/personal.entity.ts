import { Persona } from 'src/formAssociates/persona/entities/persona.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';

@Entity('personal')
export class Personal {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Persona, (persona) => persona.personal, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'personaId' })
  persona: Persona;

  @Column({ unique: true })
  personaId: number;

  @Column({ nullable: false })
  occupation: string;

  @Column({
    type: 'tinyint',
    width: 1,
    default: true,
    transformer: {
      to: (v?: boolean) => (v ? 1 : 0),
      from: (v: number) => !!v,
    },
  })
  isActive: boolean;

  @Column({ type: 'date', nullable: true })
  startWorkDate: string | null;

  @Column({ type: 'date', nullable: true })
  endWorkDate: string | null;
}