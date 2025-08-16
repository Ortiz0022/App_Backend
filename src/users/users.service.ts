// src/users/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './entities/user.entity';
import { Role } from 'src/role/entities/role.entity';
import { UserDto } from './dto/UserDto';
import { hash } from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  // 👉 Devuelve a todos los usuarios incluyendo 'password' (tal como esté en BD)
  async findAllUsers(): Promise<User[]> {
    return this.usersRepository.find({
      relations: ['role'],
    });
  }

  // 👉 Devuelve un usuario por id incluyendo 'password'
  async findOneUser(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['role'],
    });
    if (!user) throw new NotFoundException(`Usuario ${id} no encontrado`);
    return user;
  }

  // 👉 Crea usuario hasheando la contraseña, pero devuelve el registro incluyendo el hash
async createUser(userDto: UserDto): Promise<User> {
  if (userDto.password) {
    userDto.password = await hash(userDto.password, 10);
  }

  const role = await this.roleRepository.findOne({
    where: { id: userDto.roleId },
  });
  if (!role) {
    throw new NotFoundException(`Rol con ID ${userDto.roleId} no encontrado`);
  }

  const newUser = this.usersRepository.create({
    ...userDto,
    role,
  });

  // Aquí sí devuelve un User completo con id y demás
  const saved = await this.usersRepository.save(newUser);
  return saved;
}

  // 👉 Actualiza usuario (si cambia password, se re-hashea)
  async updateUser(id: number, userDto: Partial<UserDto>): Promise<User> {
    const toUpdate: any = { ...userDto };

    if (userDto.password) {
      toUpdate.password = await hash(userDto.password, 10);
    }

    if ((userDto as any).roleId) {
      const role = await this.roleRepository.findOne({
        where: { id: (userDto as any).roleId },
      });
      if (!role) {
        throw new NotFoundException(
          `Rol con ID ${(userDto as any).roleId} no encontrado`,
        );
      }
      toUpdate.role = role;
      delete toUpdate.roleId;
    }

    await this.usersRepository.update(id, toUpdate);
    // Devuelve el usuario actualizado incluyendo 'password'
    const updated = await this.usersRepository.findOne({
      where: { id },
      relations: ['role'],
    });
    if (!updated) throw new NotFoundException(`Usuario ${id} no encontrado`);
    return updated;
  }

  deleteUser(id: number) {
    return this.usersRepository.delete(id);
  }
}
