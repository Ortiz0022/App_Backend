import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { VoluntarioIndividual } from '../../voluntario-individual/entities/voluntario-individual.entity';
import { Organizacion } from '../../organizacion/entities/organizacion.entity';
import { SolicitudStatus } from '../dto/solicitud-voluntariado-status.enum';

@Entity('solicitudesVoluntariado')
export class SolicitudVoluntariado {
  @PrimaryGeneratedColumn()
  idSolicitudVoluntariado: number;

  @Column({ type: 'varchar', length: 50 })
  tipoSolicitante: string;

  @OneToOne(() => VoluntarioIndividual, (voluntario) => voluntario.solicitud, {
    eager: false,
    cascade: true,
    nullable: true,
  })
  @JoinColumn({ name: 'idVoluntario' })
  voluntario?: VoluntarioIndividual;

  @OneToOne(() => Organizacion, (organizacion) => organizacion.solicitud, {
    eager: false,
    cascade: true,
    nullable: true,
  })
  @JoinColumn({ name: 'idOrganizacion' })
  organizacion?: Organizacion;

  @Column({
    type: 'enum',
    enum: SolicitudStatus,
    default: SolicitudStatus.PENDIENTE,
  })
  estado: SolicitudStatus;

  @Column({ type: 'date' })
  fechaSolicitud: Date;

  @Column({ type: 'date', nullable: true })
  fechaResolucion?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  motivo?: string;

  // ✅ NUEVO: Campo JSON para almacenar URLs de documentos
  @Column({ type: 'json', nullable: true })
  formData?: {
    cv: string[];
    cedula: string[];
    carta: string[];
  };

  // ✅ NUEVO: URLs temporales que se copiarán al aprobar
  @Column({ type: 'varchar', length: 500, nullable: true })
  cvUrlTemp?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  cedulaUrlTemp?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  cartaUrlTemp?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}