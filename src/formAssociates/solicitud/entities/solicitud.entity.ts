import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { SolicitudStatus } from '../dto/solicitud-status.enum';
import { Persona } from 'src/formAssociates/persona/entities/persona.entity';
import { Associate } from 'src/formAssociates/associate/entities/associate.entity';

@Entity('solicitudes')
export class Solicitud {
  @PrimaryGeneratedColumn()
  idSolicitud: number;

  @OneToOne(() => Persona, { eager: false, cascade: false })
  @JoinColumn({ name: 'idPersona' })
  persona: Persona;

  // FK al Asociado (se crea en el mismo momento que la solicitud)
  @OneToOne(() => Associate, (asociado) => asociado.solicitud, {
    eager: false,
    cascade: true,
  })
  @JoinColumn({ name: 'idAsociado' })
  asociado: Associate;

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

   @Column({ type: 'json', nullable: true })
  formData?: {
    cedula: string[];
    planoFinca: string[];
  };


  @Column({ type: 'varchar', length: 500, nullable: true })
  cedulaUrlTemp?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  planoFincaUrlTemp?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}