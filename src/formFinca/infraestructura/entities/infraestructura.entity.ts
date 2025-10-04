import { FincaInfraestructura } from 'src/formFinca/finca-infraestructura/entities/fincaInfraestructura.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';


@Entity('infraestructuras')
export class Infraestructura {
  @PrimaryGeneratedColumn({ name: 'idInfraestructura', type: 'int' })
  idInfraestructura: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  descripcion?: string;

  // lado "uno" de la relación (opcional para navegar)
  @OneToMany(() => FincaInfraestructura, (fi) => fi.infraestructura)
  fincaLinks: FincaInfraestructura[];
}
