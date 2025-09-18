import { User } from "src/users/entities/user.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Role {
@PrimaryGeneratedColumn()
id: number;

@Column({ unique: true }) // evita duplicados
name: string;

@OneToMany(() => User, (user) => user.role)
  users: User[];
}