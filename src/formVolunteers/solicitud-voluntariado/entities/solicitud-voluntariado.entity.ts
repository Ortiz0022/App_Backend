import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';


import { SolicitudStatus } from '../dto/solicitud-voluntariado-status.enum';
import { VoluntarioIndividual } from 'src/formVolunteers/voluntario-individual/entities/voluntario-individual.entity';

@Entity('solicitudesVoluntariado')
export class SolicitudVoluntariado {
  @PrimaryGeneratedColumn()
  idSolicitudVoluntariado: number;

  @Column({ type: 'varchar', length: 50 })
  tipoSolicitante: string;

  @OneToOne(() => VoluntarioIndividual, (voluntario) => voluntario.solicitud, {
    eager: false,
    cascade: true,
  })
  @JoinColumn({ name: 'idVoluntario' })
  voluntario: VoluntarioIndividual;

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}