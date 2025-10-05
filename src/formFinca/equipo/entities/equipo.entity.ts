
import { FincaEquipo } from 'src/formFinca/finca-equipo/entities/finca-equipo.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('equipos')
export class Equipo {
  @PrimaryGeneratedColumn()
  idEquipo: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'int' })
  noAparatos: number;

  @Column({ type: 'int' })
  noBebederos: number;

  @Column({ type: 'int' })
  noSaleros: number;

  // Relación con la tabla intermedia
  @OneToMany(() => FincaEquipo, (fincaEquipo) => fincaEquipo.equipo)
  fincasEquipos: FincaEquipo[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}