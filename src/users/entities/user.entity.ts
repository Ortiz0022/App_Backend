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

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ManyToOne(() => Role, (role) => role.users, { eager: false, nullable: false })
  role: Role;

  @Column({ type:'uuid', unique: true, name: 'reset_password_token', nullable: true })
  resetPasswordToken: string | null;

  @Column({ type: 'datetime', nullable: true })
  resetPasswordTokenExpiresAt: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  pendingEmail: string | null;

  @Column({ type: 'uuid', nullable: true })
  emailChangeToken: string | null;

  @Column({ type: 'datetime', nullable: true })
  emailChangeTokenExpiresAt: Date | null;
}

