import { FincaTipoCerca } from 'src/formFinca/finca-tipo-cerca/entities/finca-tipo-cerca.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';


@Entity('tiposcerca')
export class TipoCerca {
  @PrimaryGeneratedColumn({ name: 'idTipoCerca', type: 'int' })
  idTipoCerca: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @OneToMany(() => FincaTipoCerca, (fc) => fc.tipoCerca)
  fincaLinks: FincaTipoCerca[];
}
