import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Persona } from 'src/formAssociates/persona/entities/persona.entity';
import { Solicitud } from 'src/formAssociates/solicitud/entities/solicitud.entity';
import { Finca } from 'src/finca/entities/finca.entity';
import { NucleoFamiliar } from 'src/formAssociates/nucleo-familiar/entities/nucleo-familiar.entity';

@Entity('associates')
export class Associate {
  @PrimaryGeneratedColumn()
  idAsociado: number;

  // Relación 1:1 con Persona
  @OneToOne(() => Persona, { eager: true })
  @JoinColumn({ name: 'idPersona' })
  persona: Persona;

  // Datos específicos de asociado - Finca
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  distanciaFinca?: string;

  @Column({ type: 'boolean', default: false })
  viveEnFinca: boolean;

  // Ganado
  @Column({ type: 'varchar', length: 100, nullable: true })
  marcaGanado?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  CVO?: string;

  // Estado del asociado
  // true = ACTIVO (solicitud aprobada y asociado puede operar)
  // false = INACTIVO (solicitud pendiente/rechazada o asociado desactivado manualmente)
  @Column({ type: 'boolean', default: false })
  estado: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relación 1:N con Fincas
  @OneToMany(() => Finca, (finca) => finca.asociado)
  fincas: Finca[];

  // Relación inversa 1:1 con Solicitud
  @OneToOne(() => Solicitud, (solicitud) => solicitud.asociado)
  solicitud: Solicitud;


  @OneToOne(() => NucleoFamiliar, (nucleoFamiliar) => nucleoFamiliar.asociado)
    nucleoFamiliar?: NucleoFamiliar;

}