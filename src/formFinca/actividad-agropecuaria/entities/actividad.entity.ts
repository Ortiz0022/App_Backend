import { Finca } from 'src/formFinca/finca/entities/finca.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';


@Entity('actividadagropecuaria')
@Unique(['idFinca', 'nombre']) // evita repetir la misma actividad dentro de una finca
export class ActividadAgropecuaria {
  @PrimaryGeneratedColumn({ name: 'idActividad', type: 'int' })
  idActividad: number;

  @Column({ name: 'idFinca', type: 'int' })
  idFinca: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @ManyToOne(() => Finca, (f) => (f as any).actividades, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idFinca' })
  finca: Finca;
}
