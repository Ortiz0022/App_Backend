import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne } from 'typeorm';
import { Role } from 'src/role/entities/role.entity';
import { Personal } from 'src/personal/entities/personal.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string; 

 @Column({ select: false })
  password: string;

  @Column({ unique: true })
  email: string;

  @ManyToOne(() => Role, (role) => role.users, { eager: false, nullable: false })
  role: Role;

  @Column({ type:'uuid', unique: true, name: 'reset_password_token', nullable: true })
  resetPasswordToken: string | null;

  @Column({ type: 'datetime', nullable: true })
  resetPasswordTokenExpiresAt: Date | null;

}

