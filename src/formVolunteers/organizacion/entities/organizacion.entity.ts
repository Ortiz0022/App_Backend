import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { SolicitudVoluntariado } from '../../solicitud-voluntariado/entities/solicitud-voluntariado.entity';
import { Representante } from '../../representante/entities/representante.entity';
import { RazonSocial } from '../../razon-social/entities/razon-social.entity';
import { Disponibilidad } from '../../disponibilidad/entities/disponibilidad.entity';
import { AreaInteres } from '../../areas-interes/entities/areas-interes.entity';

@Entity('organizaciones')
export class Organizacion {
  @PrimaryGeneratedColumn()
  idOrganizacion: number;

  @Column({ type: 'varchar', length: 20 })
  cedulaJuridica: string;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'int' })
  numeroVoluntarios: number;

  @Column({ type: 'varchar', length: 255 })
  direccion: string;

  @Column({ type: 'varchar', length: 15 })
  telefono: string;

  @Column({ type: 'varchar', length: 100 })
  email: string;

  @Column({ type: 'varchar', length: 100 })
  tipoOrganizacion: string;

  @Column({ type: 'boolean', default: false })
  isActive: boolean;

  @OneToOne(() => SolicitudVoluntariado, (solicitud) => solicitud.organizacion)
  solicitud?: SolicitudVoluntariado;

  @OneToMany(() => Representante, (representante) => representante.organizacion, {
    cascade: true,
  })
  representantes?: Representante[];

  @OneToMany(() => RazonSocial, (razonSocial) => razonSocial.organizacion, {
    cascade: true,
  })
  razonesSociales?: RazonSocial[];

  @OneToMany(() => Disponibilidad, (disponibilidad) => disponibilidad.organizacion, {
    cascade: true,
  })
  disponibilidades?: Disponibilidad[];

  @OneToMany(() => AreaInteres, (areaInteres) => areaInteres.organizacion, {
    cascade: true,
  })
  areasInteres?: AreaInteres[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  documentoLegalUrl?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  cvUrl?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  cartaUrl?: string;
}