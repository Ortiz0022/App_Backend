
import { Finca } from 'src/formFinca/finca/entities/finca.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';

@Entity('registros_productivos')
export class RegistrosProductivos {
  @PrimaryGeneratedColumn()
  idRegistrosProductivos: number;

  @Column({ type: 'boolean', default: false })
  reproductivos: boolean;

  @Column({ type: 'boolean', default: false })
  costosProductivos: boolean;

  // Relación 1:1 con Finca
  @OneToOne(() => Finca, (finca) => finca.registrosProductivos)
  @JoinColumn({ name: 'idFinca' })
  finca: Finca;
}