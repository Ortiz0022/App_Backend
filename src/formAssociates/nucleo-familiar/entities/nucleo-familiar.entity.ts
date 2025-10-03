import { Associate } from 'src/formAssociates/associate/entities/associate.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

@Entity('nucleos_familiares')
export class NucleoFamiliar {
  @PrimaryGeneratedColumn()
  idNucleoFamiliar: number;

  @Column({ type: 'int', default: 0 })
  nucleoHombres: number;

  @Column({ type: 'int', default: 0 })
  nucleoMujeres: number;

  @Column({ type: 'int', default: 0 })
  nucleoTotal: number;

  // Relación 1:1 con Asociado
  @OneToOne(() => Associate, (associate) => associate.nucleoFamiliar)
  @JoinColumn({ name: 'idAsociado' })
  asociado: Associate;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}