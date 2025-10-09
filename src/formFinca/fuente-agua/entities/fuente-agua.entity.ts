import { Finca } from 'src/formFinca/finca/entities/finca.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';


@Entity('fuenteagua')
@Unique(['idFinca', 'nombre']) // opcional: evita duplicar el mismo nombre por finca
export class FuenteAgua {
  @PrimaryGeneratedColumn({ name: 'idFuenteAgua', type: 'int' })
  idFuenteAgua: number;

  @Column({ name: 'idFinca', type: 'int' })
  idFinca: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @ManyToOne(() => Finca, (finca) => finca.fuentesAgua, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idFinca' })
  finca: Finca;
}
