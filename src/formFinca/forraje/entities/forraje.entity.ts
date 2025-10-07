import { Finca } from 'src/formFinca/finca/entities/finca.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('forraje')
export class Forraje {
  @PrimaryGeneratedColumn()
  idForraje: number;

  @ManyToOne(() => Finca, (finca) => finca.forrajes)
  @JoinColumn({ name: 'idFinca' })
  finca: Finca;

  @Column({ type: 'varchar', length: 50 })
  tipoForraje: string;

  @Column({ type: 'varchar', length: 100 })
  variedad: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  hectareas: string;

  @Column({ type: 'varchar', length: 255 })
  utilizacion: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}