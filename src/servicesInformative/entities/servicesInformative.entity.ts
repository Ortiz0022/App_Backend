import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ServicesInformative {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  cardDescription: string;

  @Column()
  modalDescription: string;

  @Column()
  image: string;
}