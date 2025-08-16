import { User } from 'src/users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, JoinColumn } from 'typeorm';

@Entity()
export class Personal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  IDE: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  lastname1: string;

  @Column({ nullable: false })
  lastname2: string;

  @Column({ nullable: false})
  birthDate: string;

  @Column({ nullable: false })
  phone: string;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false })
  direction: string;

  @Column({ nullable: false })
  occupation: string;

  // @OneToOne(() => User, (user) => user.personal, { nullable: true })
  // @JoinColumn()
  // user: User;

}
