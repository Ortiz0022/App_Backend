import { Finca } from 'src/formFinca/finca/entities/finca.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

@Entity('infraestructura_produccion')
export class InfraestructuraProduccion {
  @PrimaryGeneratedColumn()
  idInfraestructura: number;

  @Column({ type: 'int', default: 0 })
  numeroAparatos: number;

  @Column({ type: 'int', default: 0 })
  numeroBebederos: number;

  @Column({ type: 'int', default: 0 })
  numeroSaleros: number;

  @OneToOne(() => Finca, (finca) => finca.infraestructura)
  @JoinColumn({ name: 'idFinca' })
  finca: Finca;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}