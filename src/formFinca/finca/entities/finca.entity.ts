import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { Associate } from '../../../formAssociates/associate/entities/associate.entity';
import { Propietario } from 'src/formAssociates/propietario/entities/propietario.entity';
import { RegistrosProductivos } from 'src/formFinca/registros-productivos/entities/registros-productivos.entity';
import { Geografia } from 'src/formFinca/geografia/entities/geografia.entity';
import { Hato } from 'src/formFinca/hato/entities/hato.entity';
import { FincaFuenteEnergia } from 'src/formFinca/finca-fuente-energia/entities/finca-fuente-energia.entity';
import { FincaEquipo } from 'src/formFinca/finca-equipo/entities/finca-equipo.entity';
import { Acceso } from 'src/formFinca/acceso/entities/acceso.entity';
import { MetodoRiego } from 'src/formFinca/metodo-riego/entities/metodo-riego.entity';
import { Necesidades } from 'src/formFinca/necesidades/entities/necesidades.entity';
import { CorrienteElectrica } from 'src/formFinca/corriente-electrica/entities/corriente.entity';

@Entity('fincas')
export class Finca {
  @PrimaryGeneratedColumn()
  idFinca: number;

  @ManyToOne(() => Associate, { eager: false, nullable: false })
  @JoinColumn({ name: 'idAsociado' })
  asociado: Associate;

  @Column({ type: 'int' })
  idAsociado: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  areaHa: number;

  @Column({ type: 'varchar', length: 50 })
  numeroPlano: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Propietario, (propietario) => propietario.fincas, {
    nullable: true,
  })
  @JoinColumn({ name: 'idPropietario' })
  propietario?: Propietario;

  @OneToOne(
    () => RegistrosProductivos,
    (registrosProductivos) => registrosProductivos.finca,
    { nullable: true },
  )
  registrosProductivos?: RegistrosProductivos;

  @ManyToOne(() => Geografia, (geografia) => geografia.fincas, {
    nullable: true,
  })
  @JoinColumn({ name: 'idGeografia' })
  geografia?: Geografia;

  @Column({ type: 'int', nullable: true })
  idGeografia?: number;

  @OneToOne(() => Hato, (hato) => hato.finca, {
    nullable: true,
  })
  hato?: Hato;

  @OneToMany(
    () => FincaFuenteEnergia,
    (fincaFuenteEnergia) => fincaFuenteEnergia.finca,
  )
  fincasFuentesEnergia?: FincaFuenteEnergia[];

  @OneToMany(() => FincaEquipo, (fincaEquipo) => fincaEquipo.finca)
  fincasEquipos?: FincaEquipo[];

  @OneToMany(() => Acceso, (acceso) => acceso.finca)
  accesos?: Acceso[];

  @OneToMany(() => MetodoRiego, (metodoRiego) => metodoRiego.finca)
  metodosRiego?: MetodoRiego[];

  // --- Corriente eléctrica (catálogo) ---
@Column({ name: 'idCorriente', type: 'int', nullable: true })
idCorriente?: number;

@ManyToOne(() => CorrienteElectrica, (c) => c.fincas, {
  nullable: true,
  eager: true, // si quieres que venga cargado automáticamente al hacer GET de la finca
})
@JoinColumn({
  name: 'idCorriente',                       // FK en Finca
  referencedColumnName: 'idCorrienteElectrica', // PK en CorrienteElectrica
})
corriente?: CorrienteElectrica;
}