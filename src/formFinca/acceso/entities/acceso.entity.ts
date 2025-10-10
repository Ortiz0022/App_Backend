
import { Finca } from 'src/formFinca/finca/entities/finca.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('accesos')
export class Acceso {
  @PrimaryGeneratedColumn()
  idAcceso: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  // Relación N:1 con Finca
  @ManyToOne(() => Finca, (finca) => finca.accesos)
  @JoinColumn({ name: 'idFinca' })
  finca: Finca;
}