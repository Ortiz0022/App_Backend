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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}