
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

  // ✅ CAMBIO: De varchar a JSON para guardar arrays
  @Column({ type: 'json' })
  dias: string[];

  // ✅ CAMBIO: De varchar a JSON para guardar arrays (y renombrar a plural)
  @Column({ type: 'json' })
  horarios: string[];

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