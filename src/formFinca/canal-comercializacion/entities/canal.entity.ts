import { Finca } from 'src/formFinca/finca/entities/finca.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';


@Entity('canalcomercializacion')
export class CanalComercializacion {
  @PrimaryGeneratedColumn({ name: 'idCanal', type: 'int' })
  idCanal: number;

  @Column({ name: 'idFinca', type: 'int' })
  idFinca: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @ManyToOne(() => Finca, (f) => (f as any).canales, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idFinca' })
  finca: Finca;
}
