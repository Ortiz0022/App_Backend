import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Persona } from '../../../formAssociates/persona/entities/persona.entity';
import { SolicitudVoluntariado } from '../../solicitud-voluntariado/entities/solicitud-voluntariado.entity';
import { Disponibilidad } from '../../disponibilidad/entities/disponibilidad.entity';
import { AreaInteres } from '../../areas-interes/entities/areas-interes.entity';

@Entity('voluntarios-individuales')
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

  @OneToMany(() => Disponibilidad, (disponibilidad) => disponibilidad.voluntario, {
    cascade: true,
  })
  disponibilidades?: Disponibilidad[];

  @OneToMany(() => AreaInteres, (areaInteres) => areaInteres.voluntario, {
    cascade: true,
  })
  areasInteres?: AreaInteres[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
  @Column({ type: 'varchar', length: 500, nullable: true })
  cvUrl?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  cartaUrl?: string;
}