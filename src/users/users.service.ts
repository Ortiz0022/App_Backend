import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { User } from "./entities/user.entity";
import { Role } from "src/role/entities/role.entity";
import { UserDto } from "./dto/UserDto";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async findAllUsers(): Promise<User[]> {
    return this.usersRepository.find({
      relations: ['role'], // ✅ incluye el rol en las respuestas
    });
  }

  findOneUser(id: number) {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['role'],
    });
  }

  async createUser(userDto: UserDto) {
    const role = await this.roleRepository.findOne({
      where: { id: userDto.roleId },
    });

    if (!role) {
      throw new NotFoundException(`Rol con ID ${userDto.roleId} no encontrado`);
    }

    const newUser = this.usersRepository.create({
      ...userDto,
      role, // ✅ asigna el objeto Role completo
    });

    return this.usersRepository.save(newUser);
  }

  deleteUser(id: number) {
    return this.usersRepository.delete(id);
  }

  updateUser(id: number, userDto: any) {
    return this.usersRepository.update(id, userDto);
  }
}
