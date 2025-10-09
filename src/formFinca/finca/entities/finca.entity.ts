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
import {FincaOtroEquipo } from 'src/formFinca/otros-equipos/entities/finca-equipo.entity';
import { Acceso } from 'src/formFinca/acceso/entities/acceso.entity';
import { MetodoRiego } from 'src/formFinca/metodo-riego/entities/metodo-riego.entity';
import { Necesidades } from 'src/formFinca/necesidades/entities/necesidades.entity';
import { CorrienteElectrica } from 'src/formFinca/corriente-electrica/entities/corriente.entity';
import { FincaInfraestructura } from 'src/formFinca/finca-infraestructura/entities/fincaInfraestructura.entity';
import { FincaTipoCerca } from 'src/formFinca/finca-tipo-cerca/entities/finca-tipo-cerca.entity';
import { CanalComercializacion } from 'src/formFinca/canal-comercializacion/entities/canal.entity';
import { FuenteAgua } from 'src/formFinca/fuente-agua/entities/fuente-agua.entity';
import { ActividadAgropecuaria } from 'src/formFinca/actividad-agropecuaria/entities/actividad.entity';
import { Forraje } from 'src/formFinca/forraje/entities/forraje.entity';
import { InfraestructuraProduccion } from 'src/formFinca/equipo/entities/equipo.entity';

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
  areaHa: string; 

  @Column({ type: 'varchar', length: 50 })
  numeroPlano: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  planoFincaUrl?: string;

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

  @OneToOne(() => Hato, (hato) => hato.finca, {
    nullable: true,
  })
  hato?: Hato;

  @OneToMany(
    () => FincaFuenteEnergia,
    (fincaFuenteEnergia) => fincaFuenteEnergia.finca,
  )
  fincasFuentesEnergia?: FincaFuenteEnergia[];

  @OneToMany(() => Acceso, (acceso) => acceso.finca)
  accesos?: Acceso[];

  @OneToMany(() => MetodoRiego, (metodoRiego) => metodoRiego.finca)
  metodosRiego?: MetodoRiego[];

  @Column({ name: 'idCorriente', type: 'int', nullable: true })
  idCorriente?: number;

  @ManyToOne(() => CorrienteElectrica, (c) => c.fincas, { nullable: true, eager: false })
  @JoinColumn({ name: 'idCorriente', referencedColumnName: 'idCorrienteElectrica' })
  corriente?: CorrienteElectrica;

  @OneToMany(() => FincaInfraestructura, (fi) => fi.finca)
  fincaInfraestructuras?: FincaInfraestructura[];

  @OneToMany(() => FincaTipoCerca, (ftc) => ftc.finca)
  fincaTiposCerca?: FincaTipoCerca[];

  @OneToMany(() => CanalComercializacion, (c) => c.finca)
  canalesComercializacion?: CanalComercializacion[];

  @OneToMany(() => FuenteAgua, (fa) => fa.finca)
  fuentesAgua?: FuenteAgua[];

  @OneToMany(() => ActividadAgropecuaria, (actividad) => actividad.finca)
  actividades?: ActividadAgropecuaria[];

  @OneToMany(() => Forraje, (forraje) => forraje.finca)
  forrajes?: Forraje[];

  @OneToOne(() => InfraestructuraProduccion, (infra) => infra.finca)
  infraestructura?: InfraestructuraProduccion;

  @OneToMany(() => FincaOtroEquipo, (equipo) => equipo.finca)
  otrosEquipos?: FincaOtroEquipo[];

  @OneToMany(() => FincaTipoCerca, (link) => link.finca)
  tipoCercaLinks?: FincaTipoCerca[];
  
  @OneToMany(() => FincaInfraestructura, (link) => link.finca)
  infraLinks?: FincaInfraestructura[];
}