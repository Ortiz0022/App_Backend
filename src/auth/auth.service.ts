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
import { v4 as uuidv4, v4 } from 'uuid';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/role/entities/role.entity';
import { RequestResetPasswordDto } from './dto/request-reset-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import {EmailService} from 'src/email/email.service'
import { ChangePasswordDto } from './dto/change-password.dto';
import { EncoderService } from 'src/auth/encoder.service';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>, // (no se usa en login, pero útil en otros flujos)

    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly encoderService: EncoderService,
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

    if (!user.isActive) {
    throw new UnauthorizedException('Usuario desactivado');
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


  //generar token restaurar contraseña
  async requestResetPassword(requestResetPasswordDto:RequestResetPasswordDto) :Promise<void>{
    const { email } = requestResetPasswordDto;
    const user: User | null = await this.userRepo.findOneBy({ email });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    user.resetPasswordToken = uuidv4();
    
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 15); //Válido por 15 minutos
    user.resetPasswordTokenExpiresAt = expires;
    
    this.userRepo.save(user);

    //link al front
    const resetLink = `${process.env.APP_URL}/reset-password?token=${user.resetPasswordToken}`;
    // send email with reset token
    await this.emailService.sendResetPasswordEmail(email, resetLink);

  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void>{
    const {resetPasswordToken, password} = resetPasswordDto;

    const user: User | null = await this.userRepo.findOneBy({resetPasswordToken})
    if(!user){
      throw new NotFoundException('Token inválido');
    }

    if(!user.resetPasswordTokenExpiresAt || user.resetPasswordTokenExpiresAt.getTime() < Date.now())
    {
      user.resetPasswordToken = null;
      user.resetPasswordTokenExpiresAt = null;
      await this.userRepo.save(user);
      throw new UnauthorizedException('Token expirado');
    }

    user.password = await hash(password, 10); //hashear la nueva contraseña
    user.resetPasswordToken = null;
    user.resetPasswordTokenExpiresAt = null;
    await this.userRepo.save(user);
  }


   //Cambiar contraseña
   async changePassword(dto: ChangePasswordDto, authUser: { userId: number }): Promise<void> {
      const { oldPassword, newPassword } = dto;

      const user = await this.userRepo.findOne({
        where: { id: authUser.userId },
        select: ['id', 'password'], // asegúrate de traer el hash
      });
      if (!user) throw new NotFoundException('Usuario no encontrado');

      const ok = await this.encoderService.checkPassword(oldPassword, user.password);
      if (!ok) throw new UnauthorizedException('Contraseña actual incorrecta');

      user.password = await this.encoderService.encodePassword(newPassword);
      await this.userRepo.save(user);
    }

}