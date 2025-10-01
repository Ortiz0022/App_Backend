import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Associate } from '../../associates/entities/associate.entity';

@Entity('fincas')
export class Finca {
  @PrimaryGeneratedColumn()
  idFinca: number;

  // Relación Many-to-One con Associate
  @ManyToOne(() => Associate, { eager: false, nullable: false })
  @JoinColumn({ name: 'idAsociado' })
  asociado: Associate;

  @Column({ type: 'int' })
  idAsociado: number;

  // Datos de la finca
  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  areaHa: number; // Área en hectáreas

  @Column({ type: 'varchar', length: 50 })
  numeroPlano: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}