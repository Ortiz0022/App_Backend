import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne } from 'typeorm';
import { Role } from 'src/role/entities/role.entity';
import { Personal } from 'src/personal/entities/personal.entity';

@Entity()
export class User {
  static username(username: any): (target: typeof import("../../auth/auth.service").AuthService, propertyKey: undefined, parameterIndex: 0) => void {
      throw new Error("Method not implemented.");
  }
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string; 

  @Column()
  password: string; //

  @Column({ unique: true })
  email: string;

  @ManyToOne(() => Role, (role) => role.users, { eager: false, nullable: false })
  role: Role;

  @Column({ type:'uuid', unique: true, name: 'reset_password_token', nullable: true })
  resetPasswordToken: string | null;

  // @OneToOne(() => Personal, (personal) => personal.user, { nullable: false })
  // personal: Personal;
}

