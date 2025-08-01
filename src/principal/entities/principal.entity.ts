import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Principal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false })
  description: string;

}