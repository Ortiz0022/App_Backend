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

@Entity('areasInteres')
export class AreaInteres {
  @PrimaryGeneratedColumn()
  idAreaInteres: number;

  @Column({ type: 'varchar', length: 255 })
  nombreArea: string;

  @ManyToOne(() => Organizacion, (organizacion) => organizacion.areasInteres, {
    eager: false,
    nullable: true,
  })
  @JoinColumn({ name: 'idOrganizacion' })
  organizacion?: Organizacion;

  @ManyToOne(() => VoluntarioIndividual, (voluntario) => voluntario.areasInteres, {
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