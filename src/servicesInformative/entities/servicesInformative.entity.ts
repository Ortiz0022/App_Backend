import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ServicesImage } from "./servicesImage.entity";

@Entity("services_informative")
export class ServicesInformative {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  cardDescription: string;

  @Column()
  modalDescription: string;

  @OneToMany(
    () => ServicesImage,
    (serviceImage: ServicesImage) => serviceImage.serviceInformative
  )
  serviceImages: ServicesImage[];
}