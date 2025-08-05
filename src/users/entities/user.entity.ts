import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Role } from 'src/role/entities/role.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  IDE: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  lastname: string;

  @Column({ type: 'date', nullable: false })
  birthdayDate: string;

  @Column({ nullable: false })
  phone: string;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false })
  direction: string;

  @Column({ nullable: false })
  occupation: string;

  @ManyToOne(() => Role, (role) => role.users, { eager: false, nullable: false })
  role: Role;
}
