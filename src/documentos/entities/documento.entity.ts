import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('documentoasociado')
export class Documento {
  @PrimaryGeneratedColumn()
  idDocumento: number;

  @Column()
  idAsociado: number;

  @Column({ nullable: true })
  idSolicitud: number;

  @Column({ type: 'varchar', length: 50 })
  tipoDocumento: string;

  @Column({ type: 'varchar', length: 255 })
  nombreArchivo: string;

  @Column({ type: 'varchar', length: 500 })
  cloudinaryId: string;

  @Column({ type: 'varchar', length: 500 })
  urlPublica: string;

  @CreateDateColumn()
  fechaSubida: Date;

  @Column({ type: 'int' })
  tamanioBytes: number;
}