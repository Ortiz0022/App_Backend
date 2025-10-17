import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Organizacion } from '../../organizacion/entities/organizacion.entity';
import { VoluntarioIndividual } from '../../voluntario-individual/entities/voluntario-individual.entity';

@Entity('disponibilidades')
export class Disponibilidad {
  @PrimaryGeneratedColumn()
  idDisponibilidad: number;

  @Column({ type: 'varchar', length: 100 })
  tipoEntidad: string; // 'ORGANIZACION' o 'VOLUNTARIO'

  @Column({ type: 'date' })
  fechaInicio: Date;

  @Column({ type: 'date' })
  fechaFin: Date;

  @Column({ type: 'varchar', length: 255 })
  dias: string;

  @Column({ type: 'varchar', length: 100 })
  horario: string;

  @ManyToOne(() => Organizacion, (organizacion) => organizacion.disponibilidades, {
    eager: false,
    nullable: true,
  })
  @JoinColumn({ name: 'idOrganizacion' })
  organizacion?: Organizacion;

  @ManyToOne(() => VoluntarioIndividual, (voluntario) => voluntario.disponibilidades, {
    eager: false,
    nullable: true,
  })
  @JoinColumn({ name: 'idVoluntario' })
  voluntario?: VoluntarioIndividual;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}