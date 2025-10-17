import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Organizacion } from '../../organizacion/entities/organizacion.entity';

@Entity('razones_sociales')
export class RazonSocial {
  @PrimaryGeneratedColumn()
  idRazonSocial: number;

  @Column({ type: 'varchar', length: 255 })
  razonSocial: string;

  @ManyToOne(() => Organizacion, (organizacion) => organizacion.razonesSociales, {
    eager: false,
  })
  @JoinColumn({ name: 'idOrganizacion' })
  organizacion: Organizacion;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}