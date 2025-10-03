import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { Associate } from '../../../formAssociates/associate/entities/associate.entity';
import { Propietario } from 'src/formAssociates/propietario/entities/propietario.entity';
import { RegistrosProductivos } from 'src/formFinca/registros-productivos/entities/registros-productivos.entity';
import { Geografia } from 'src/formFinca/geografia/entities/geografia.entity';

@Entity('fincas')
export class Finca {
  @PrimaryGeneratedColumn()
  idFinca: number;

  // Relación Many-to-One con Associate
  @ManyToOne(() => Associate, { eager: false, nullable: false })
  @JoinColumn({ name: 'idAsociado' })
  asociado: Associate;

  @Column({ type: 'int' })
  idAsociado: number;

  // Datos de la finca
  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  areaHa: number; // Área en hectáreas

  @Column({ type: 'varchar', length: 50 })
  numeroPlano: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;


  @ManyToOne(() => Propietario, (propietario) => propietario.fincas)
  @JoinColumn({ name: 'idPropietario' })
  propietario: Propietario;


  @OneToOne(
    () => RegistrosProductivos,
    (registrosProductivos) => registrosProductivos.finca,
    { eager: true }, // Carga automática
  )
  registrosProductivos?: RegistrosProductivos;


  @ManyToOne(() => Geografia, (geografia) => geografia.fincas, {
    eager: true, // Carga automática
  })
  @JoinColumn({ name: 'idGeografia' })
  geografia: Geografia;



}