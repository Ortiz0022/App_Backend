import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Volunteers {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  IDE: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  lastName1: string;

  @Column({ nullable: false })
  lastName2: string;

  @Column({ nullable: false, type: 'date' })
  birthDate: string;

  @Column({ nullable: false })
  phone: string;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false })
  address: string;

  @Column({ nullable: false })
  community: string;

  @Column({ nullable: false })
  volunteeringType: string;

  @Column({ nullable: false })
  availability: string;

  @Column({ nullable: false, type: 'text' })
  previousExperience: string;

  @Column({ nullable: false, type: 'text' })
  motivation: string;

  @Column({ nullable: false })
  acceptTerms: boolean;

  @Column({ nullable: false })
  receiveInfo: boolean;
}
