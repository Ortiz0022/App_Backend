import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Persona } from '../../../formAssociates/persona/entities/persona.entity';
import { Organizacion } from '../../organizacion/entities/organizacion.entity';

@Entity('representantes')
export class Representante {
  @PrimaryGeneratedColumn()
  idRepresentante: number;

  @OneToOne(() => Persona, { eager: false, cascade: false })
  @JoinColumn({ name: 'idPersona' })
  persona: Persona;

  @Column({ type: 'varchar', length: 100 })
  cargo: string;

  @ManyToOne(() => Organizacion, (organizacion) => organizacion.representantes, {
    eager: false,
  })
  @JoinColumn({ name: 'idOrganizacion' })
  organizacion: Organizacion;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}