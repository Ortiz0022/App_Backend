import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { LoginAuthDto } from './dto/login-auth.dto';
import { compare, hash } from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/role/entities/role.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>, // (no se usa en login, pero útil en otros flujos)

    private readonly jwtService: JwtService,
  ) {}

  /**
   * Login: valida credenciales y devuelve { user, token }
   */
  async login({ email, password }: LoginAuthDto) {
    // Si en tu entidad User tienes password con select:false, añadimos el campo explícitamente:
    const user = await this.userRepo
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.role', 'role')
      .addSelect('u.password')
      .where('u.email = :email', { email })
      .getOne();

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const isValid = await compare(password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Contraseña inválida');
    }

    const payload = {
      id: user.id,
      role: user.role?.name ?? null,
      jti: uuidv4(),
    };

    const token = await this.jwtService.signAsync(payload);

    // Sanitizar para no devolver el hash:
    const { password: _removed, ...safeUser } = user;

    return {
      user: safeUser,
      token,
    };
  }

  /**
   * Opción B: Endpoint temporal para "arreglar" (hashear) la contraseña de un usuario existente.
   * BORRAR después de usar.
   */
  async devFixPassword(email: string, newPassword: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    user.password = await hash(newPassword, 10);
    await this.userRepo.save(user);

    return { ok: true, message: 'Password actualizada correctamente (bcrypt).' };
  }
}
