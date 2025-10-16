import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Persona } from '../../../formAssociates/persona/entities/persona.entity';
import { SolicitudVoluntariado } from '../../solicitud-voluntariado/entities/solicitud-voluntariado.entity';

@Entity('voluntariosIndividuales')
export class VoluntarioIndividual {
  @PrimaryGeneratedColumn()
  idVoluntario: number;

  @OneToOne(() => Persona, { eager: false, cascade: true })
  @JoinColumn({ name: 'idPersona' })
  persona: Persona;

  @Column({ type: 'varchar', length: 500 })
  motivacion: string;

  @Column({ type: 'varchar', length: 500 })
  habilidades: string;

  @Column({ type: 'varchar', length: 500 })
  experiencia: string;

  @Column({ type: 'varchar', length: 100 })
  nacionalidad: string;

  @OneToOne(() => SolicitudVoluntariado, (solicitud) => solicitud.voluntario)
  solicitud?: SolicitudVoluntariado;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}