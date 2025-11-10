import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { FincaTipoCerca } from '../../finca-tipo-cerca/entities/finca-tipo-cerca.entity';

@Entity('tiposcerca')
@Unique(['alambrePuas', 'viva', 'electrica', 'pMuerto']) // evita duplicar la misma combinación
export class TipoCerca {
  @PrimaryGeneratedColumn({ name: 'idTipoCerca', type: 'int' })
  idTipoCerca: number;

  @Column({ type: 'bool', default: false })
  alambrePuas: boolean;

  @Column({ type: 'bool', default: false })
  viva: boolean;

  @Column({ type: 'bool', default: false })
  electrica: boolean;

  @Column({ type: 'bool', default: false })
  pMuerto: boolean; 

  @OneToMany(() => FincaTipoCerca, (fc) => fc.tipoCerca)
  fincaLinks: FincaTipoCerca[];
}
