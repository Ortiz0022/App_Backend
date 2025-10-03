import { Persona } from 'src/formAssociates/persona/entities/persona.entity';
import { Finca } from 'src/finca/entities/finca.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

@Entity('propietarios')
export class Propietario {
  @PrimaryGeneratedColumn()
  idPropietario: number;

  // Relación 1:1 con Persona (un propietario es una persona)
  @OneToOne(() => Persona, (persona) => persona.propietario, {
    eager: true, // carga automática de persona al consultar propietario
    cascade: true, // permite crear persona al crear propietario
  })
  @JoinColumn({ name: 'idPersona' })
  persona: Persona;

  // Relación 1:N con Fincas (un propietario puede tener múltiples fincas)
  @OneToMany(() => Finca, (finca) => finca.propietario)
  fincas: Finca[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}