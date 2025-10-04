import { Finca } from 'src/formFinca/finca/entities/finca.entity';
import { TipoCerca } from 'src/formFinca/tipo-cerca/entities/tipo-cerca.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';


@Entity('fincatipocerca')
@Unique(['idFinca', 'idTipoCerca'])
export class FincaTipoCerca {
  @PrimaryGeneratedColumn({ name: 'idFincaTipoCerca', type: 'int' })
  id: number;

  @Column({ name: 'idFinca', type: 'int' })
  idFinca: number;

  @Column({ name: 'idTipoCerca', type: 'int' })
  idTipoCerca: number;

  @ManyToOne(() => Finca, (f) => (f as any).tipoCercaLinks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idFinca' })
  finca: Finca;

  @ManyToOne(() => TipoCerca, (tc) => tc.fincaLinks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idTipoCerca' })
  tipoCerca: TipoCerca;
}
