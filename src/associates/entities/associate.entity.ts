import {
  Entity, PrimaryGeneratedColumn, Column, Unique, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { AssociateStatus } from '../dto/associate-status.enum';

@Entity('associates')
@Unique(['cedula'])
@Unique(['email'])
export class Associate {
  @PrimaryGeneratedColumn()
  id: number;

  // Datos personales
  @Column({ type: 'varchar', length: 12 })
  cedula: string;

  @Column({ type: 'varchar', length: 30 })
  nombre: string;

  @Column({ type: 'varchar', length: 30 })
  apellido1: string;

  @Column({ type: 'varchar', length: 30 })
  apellido2: string;

  @Column({ type: 'date' })
  fechaNacimiento: string;

  // Contacto
  @Column({ type: 'varchar', length: 12 })
  telefono: string;

  @Column({ type: 'varchar', length: 100 })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  direccion?: string;

  // Finca
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  distanciaFinca?: string; // se guarda como string en TypeORM para decimal

  @Column({ type: 'boolean', default: false })
  viveEnFinca: boolean;

  // Ganado
  @Column({ type: 'varchar', length: 100, nullable: true })
  marcaGanado?: string; // código/identificador de marca (no boolean)

  @Column({ type: 'varchar', length: 100, nullable: true })
  CVO?: string;

  // Estado de la solicitud
  @Column({ type: 'enum', enum: AssociateStatus, default: AssociateStatus.PENDIENTE })
  estado: AssociateStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
