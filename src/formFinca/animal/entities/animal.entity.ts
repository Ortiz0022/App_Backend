import { Hato } from 'src/formFinca/hato/entities/hato.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('animales')
export class Animal {
  @PrimaryGeneratedColumn()
  idAnimal: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'int' })
  edad: number;

  // Relación N:1 con Hato
  @ManyToOne(() => Hato, (hato) => hato.animales, {
    eager: true,
  })
  @JoinColumn({ name: 'idHato' })
  hato: Hato;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}