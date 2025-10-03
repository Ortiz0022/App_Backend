import { Persona } from 'src/formAssociates/persona/entities/persona.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    JoinColumn,
    OneToMany,
  } from 'typeorm';
import { AssociateStatus } from '../dto/associate-status.enum';
import { Finca } from 'src/finca/entities/finca.entity';

  
  @Entity('associates')
  export class Associate {
    @PrimaryGeneratedColumn()
    idAsociado: number;
  
    // Relación 1:1 con Persona (un asociado es una persona)
    @OneToOne(() => Persona, (persona) => persona.asociado, { 
      eager: true, // carga automática de persona al consultar asociado
      cascade: true, // permite crear persona al crear asociado
    })
    @JoinColumn({ name: 'idPersona' })
    persona: Persona;
  
    // Datos específicos de asociado - Finca
    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    distanciaFinca?: string;
  
    @Column({ type: 'boolean', default: false })
    viveEnFinca: boolean;
  
    // Ganado
    @Column({ type: 'varchar', length: 100, nullable: true })
    marcaGanado?: string;
  
    @Column({ type: 'varchar', length: 100, nullable: true })
    CVO?: string;
  
    // Estado de la solicitud
    @Column({
      type: 'enum',
      enum: AssociateStatus,
      default: AssociateStatus.PENDIENTE,
    })
    estado: AssociateStatus;
  
    @Column({ type: 'varchar', length: 255, nullable: true })
    motivoRechazo?: string;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => Finca, (finca) => finca.asociado)
    fincas: Finca[];
  }