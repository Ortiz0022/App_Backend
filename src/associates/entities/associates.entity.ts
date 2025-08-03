import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Associate {
  @PrimaryGeneratedColumn()
  id: number;

  // Personal Information
  @Column({ nullable: false })
  idNumber: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  lastName1: string;

  @Column({ nullable: false })
  lastName2: string;

  @Column({ type: 'date', nullable: false })
  birthDate: string;

  // Contact Information
  @Column({ nullable: false })
  phone: string;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false })
  address: string;

  @Column({ nullable: false })
  community: string;

  // Associate Information
  @Column({ type: 'text', nullable: true })
  needs: string;

  // Documents (guardar nombres de archivo o rutas)
  @Column({ nullable: true })
  idCopy: string;

  @Column({ nullable: true })
  farmDiagnosis: string;

  @Column({ nullable: true })
  paymentProof: string;

  @Column({ nullable: true })
  farmMap: string;

  @Column({ nullable: true })
  otherDocuments: string;

  // Terms
  @Column({ default: false })
  acceptTerms: boolean;

  @Column({ default: false })
  receiveInfo: boolean;
}