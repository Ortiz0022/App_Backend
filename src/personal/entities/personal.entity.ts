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

  @Column({
  type: 'tinyint',
  width: 1,
  default: true,
  transformer: { to: (v?: boolean) => (v ? 1 : 0), from: (v: number) => !!v },
})
isActive: boolean;


  // @OneToOne(() => User, (user) => user.personal, { nullable: true })
  // @JoinColumn()
  // user: User;

}
