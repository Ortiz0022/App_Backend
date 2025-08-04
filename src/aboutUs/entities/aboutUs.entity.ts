import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class AboutUs {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false })
  description: string;
}