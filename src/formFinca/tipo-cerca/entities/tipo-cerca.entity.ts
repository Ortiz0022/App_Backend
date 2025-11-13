import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { FincaTipoCerca } from '../../finca-tipo-cerca/entities/finca-tipo-cerca.entity';

@Entity('tiposcerca')
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
