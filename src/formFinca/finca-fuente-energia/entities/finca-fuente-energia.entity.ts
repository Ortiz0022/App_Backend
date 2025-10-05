
import { Finca } from 'src/formFinca/finca/entities/finca.entity';
import { FuenteEnergia } from 'src/formFinca/FuenteEnergia/entities/fuente-energia.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('fincas_fuentes_energia')
export class FincaFuenteEnergia {
  @PrimaryGeneratedColumn()
  idFincaFuenteEnergia: number;

  // Relación N:1 con Finca
  @ManyToOne(() => Finca, (finca) => finca.fincasFuentesEnergia, {
    eager: true,
  })
  @JoinColumn({ name: 'idFinca' })
  finca: Finca;

  // Relación N:1 con FuenteEnergia
  @ManyToOne(
    () => FuenteEnergia,
    (fuenteEnergia) => fuenteEnergia.fincasFuentesEnergia,
    {
      eager: true,
    },
  )
  @JoinColumn({ name: 'idFuenteEnergia' })
  fuenteEnergia: FuenteEnergia;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}