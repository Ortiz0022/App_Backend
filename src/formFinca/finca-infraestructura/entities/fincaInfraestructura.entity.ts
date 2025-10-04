import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';

import { Infraestructura } from 'src/formFinca/infraestructura/entities/infraestructura.entity';
import { Finca } from 'src/formFinca/finca/entities/finca.entity';


@Entity('fincainfraestructura')
@Unique(['idFinca', 'idInfraestructura']) // evita duplicados
export class FincaInfraestructura {
  @PrimaryGeneratedColumn({ name: 'idFincaInfraestructura', type: 'int' })
  id: number;

  @Column({ name: 'idFinca', type: 'int' })
  idFinca: number;

  @Column({ name: 'idInfraestructura', type: 'int' })
  idInfraestructura: number;

  @ManyToOne(() => Finca, (f) => (f as any).infraLinks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idFinca' })
  finca: Finca;

  @ManyToOne(() => Infraestructura, (i) => i.fincaLinks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idInfraestructura' })
  infraestructura: Infraestructura;
}
