
import { Animal } from 'src/formFinca/animal/entities/animal.entity';
import { Finca } from 'src/formFinca/finca/entities/finca.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

@Entity('hatos')
export class Hato {
  @PrimaryGeneratedColumn()
  idHato: number;

  @Column({ type: 'varchar', length: 100 })
  tipoExplotacion: string;

  @Column({ type: 'int' })
  totalGanado: number;

  @Column({ type: 'varchar', length: 100 })
  razaPredominante: string;

  // Relación 1:1 con Finca
  @OneToOne(() => Finca, (finca) => finca.hato)
  @JoinColumn({ name: 'idFinca' })
  finca: Finca;

  // Relación 1:N con Animal
  @OneToMany(() => Animal, (animal) => animal.hato)
  animales: Animal[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}