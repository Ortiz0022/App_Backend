import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class AboutUs {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  title: string;

  @Column({
  type: 'varchar',
  length: 1000,
  })
  description: string
}