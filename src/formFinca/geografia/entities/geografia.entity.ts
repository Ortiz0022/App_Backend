
import { Finca } from 'src/formFinca/finca/entities/finca.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('geografias')
export class Geografia {
  @PrimaryGeneratedColumn()
  idGeografia: number;

  @Column({ type: 'varchar', length: 100 })
  provincia: string;

  @Column({ type: 'varchar', length: 100 })
  canton: string;

  @Column({ type: 'varchar', length: 100 })
  distrito: string;

  @Column({ type: 'varchar', length: 100, nullable: true }) 
  caserio: string;

  // Relación 1:N con Finca (una geografía puede tener múltiples fincas)
  @OneToMany(() => Finca, (finca) => finca.geografia)
  fincas: Finca[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}