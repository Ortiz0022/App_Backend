import { UserDto } from "src/users/dto/UserDto";
import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from "typeorm";
import { RoleDto } from "src/role/dto/RoleDto";
import { JwtService } from "@nestjs/jwt";
import { LoginAuthDto } from "./dto/login-auth.dto";
import { hash, compare } from 'bcrypt'

@Injectable()
export class AuthService{
constructor(
 @InjectRepository(UserDto)
    private readonly userRepo: Repository<UserDto>,
    @InjectRepository(RoleDto)
    private readonly roleRepo: Repository<RoleDto>,
    private jwtService: JwtService
){}

async login(userObjectLogin: LoginAuthDto) {
    const { email, password } = userObjectLogin;
    const findUser = await this.userRepo.findOne({ where: { email }, relations: ['roles'] });

    if (!findUser) throw new HttpException('Usuario no encontrado', 404);

    const isPasswordValid = await compare(password, findUser.password);

    if (!isPasswordValid) throw new HttpException('Contraseña invalida', 403);

    const rolesNames = findUser.roles?.map((role) => role.name);

    const payload = { 
      id: findUser.Id,
      roles: rolesNames,
      jti: uuidv4()
    };

    const token = await this.jwtService.signAsync(payload);

    const data = {
      user: findUser,
      token
    };

    return data;
  }

}


