import { Finca } from 'src/formFinca/finca/entities/finca.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';


@Entity('corrienteelectrica')
@Unique(['publica', 'privada']) // evita registros con la misma combinación
export class CorrienteElectrica {
  @PrimaryGeneratedColumn({ name: 'idCorrienteElectrica', type: 'int' })
  idCorrienteElectrica: number;

  @Column({ type: 'bool', default: false })
  publica: boolean;

  @Column({ type: 'bool', default: false })
  privada: boolean;

  // opcional: navegación inversa (no cambia tu API)
  @OneToMany(() => Finca, (f) => f.corriente)
  fincas: Finca[];
}
