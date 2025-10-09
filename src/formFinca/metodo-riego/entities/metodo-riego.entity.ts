
import { Finca } from 'src/formFinca/finca/entities/finca.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('metodos_riego')
export class MetodoRiego {
  @PrimaryGeneratedColumn()
  idMetodoRiego: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  // Relación N:1 con Finca
  @ManyToOne(() => Finca, (finca) => finca.metodosRiego, {
    eager: false,
  })
  @JoinColumn({ name: 'idFinca' })
  finca: Finca;
}