import { Associate } from 'src/formAssociates/associate/entities/associate.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('necesidades')
export class Necesidades {
  @PrimaryGeneratedColumn()
  idNecesidad: number;

  @Column({ type: 'int' })
  orden: number;

  @Column({ type: 'varchar', length: 255 })
  descripcion: string;

  // Relación N:1 con Asociado
  @ManyToOne(() => Associate, (asociado) => asociado.necesidades, {
    eager: true,
  })
  @JoinColumn({ name: 'idAsociado' })
  asociado: Associate;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}