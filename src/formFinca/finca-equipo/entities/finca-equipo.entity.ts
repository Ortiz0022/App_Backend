
import { Equipo } from 'src/formFinca/equipo/entities/equipo.entity';
import { Finca } from 'src/formFinca/finca/entities/finca.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('fincas_equipos')
export class FincaEquipo {
  @PrimaryGeneratedColumn()
  idFincaEquipo: number;

  // Relación N:1 con Finca
  @ManyToOne(() => Finca, (finca) => finca.fincasEquipos, {
    eager: true,
  })
  @JoinColumn({ name: 'idFinca' })
  finca: Finca;

  // Relación N:1 con Equipo
  @ManyToOne(() => Equipo, (equipo) => equipo.fincasEquipos, {
    eager: true,
  })
  @JoinColumn({ name: 'idEquipo' })
  equipo: Equipo;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}