import { UserDto } from "src/users/dto/UserDto";
import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from "typeorm";
import { RoleDto } from "src/role/dto/RoleDto";
import { JwtService } from "@nestjs/jwt";
import { LoginAuthDto } from "./dto/login-auth.dto";
import { hash, compare } from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User } from "src/users/entities/user.entity";

@Injectable()
export class AuthService{
constructor(
 @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(RoleDto)
    private readonly roleRepo: Repository<RoleDto>,
    private jwtService: JwtService
){}
// ...existing code...
async login(userObjectLogin: LoginAuthDto) {
    const { email, password } = userObjectLogin;
    const findUser = await this.userRepo.findOne({ where: { email }, relations: ['role'] });

    if (!findUser) throw new HttpException('Usuario no encontrado', 404);

    const isPasswordValid = await compare(password, findUser.password);

    if (!isPasswordValid) throw new HttpException('Contraseña invalida', 403);

    const roleName = findUser.role?.name; // <-- Cambiado: accede directamente a la propiedad 'name'

    const payload = { 
      id: findUser.id,
      role: roleName, // <-- Cambiado: usa 'role' y 'roleName'
      jti: uuidv4()
    };

    const token = await this.jwtService.signAsync(payload);

    const data = {
      user: findUser,
      token
    };

    return data;
}
// ...existing code...

}


