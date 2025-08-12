import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Role } from 'src/role/entities/role.entity';

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
}

