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

@Entity('finca_otros_equipos')
export class FincaOtroEquipo {
  @PrimaryGeneratedColumn()
  idFincaOtroEquipo: number;

  @ManyToOne(() => Finca, (finca) => finca.otrosEquipos, {
    eager: true,
  })
  @JoinColumn({ name: 'idFinca' })
  finca: Finca;

  @Column({ type: 'varchar', length: 100 })
  nombreEquipo: string;

  @Column({ type: 'int', default: 1 })
  cantidad: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}