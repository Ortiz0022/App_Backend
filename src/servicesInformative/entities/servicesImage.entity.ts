import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ServicesInformative } from "./servicesInformative.entity";

@Entity("services_images")
export class ServicesImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "text" })
  imageUrl: string;

  @Column()
  serviceInformativeId: number;

  @ManyToOne(
    () => ServicesInformative,
    (service) => service.serviceImages,
    { onDelete: "CASCADE" }
  )
  @JoinColumn({ name: "serviceInformativeId" })
  serviceInformative: ServicesInformative;
}