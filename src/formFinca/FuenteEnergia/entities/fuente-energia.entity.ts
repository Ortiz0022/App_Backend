
import { FincaFuenteEnergia } from 'src/formFinca/finca-fuente-energia/entities/finca-fuente-energia.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('fuentes_energia')
export class FuenteEnergia {
  @PrimaryGeneratedColumn()
  idFuenteEnergia: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  // Relación con la tabla intermedia
  @OneToMany(
    () => FincaFuenteEnergia,
    (fincaFuenteEnergia) => fincaFuenteEnergia.fuenteEnergia,
  )
  fincasFuentesEnergia: FincaFuenteEnergia[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}