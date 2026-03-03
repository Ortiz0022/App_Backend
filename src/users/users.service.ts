import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { hash } from "bcrypt";
import { v4 as uuidv4 } from "uuid";

import { User } from "./entities/user.entity";
import { Role } from "src/role/entities/role.entity";
import { EmailService } from "src/email/email.service";
import { CreateUserDto } from "./dto/CreateUserDto";
import { UpdateUserDto } from "./dto/UpdateUserDto";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Role) private roleRepository: Repository<Role>,
    private readonly emailService: EmailService,
  ) {}

  async findAllUsers() {
    return this.usersRepository.find({ relations: ["role"] });
  }

  async findOneUser(id: number) {
    const user = await this.usersRepository.findOne({ where: { id }, relations: ["role"] });
    if (!user) throw new NotFoundException(`Usuario ${id} no encontrado`);
    return user;
  }

  async createUser(dto: CreateUserDto) {
    const role = await this.roleRepository.findOne({ where: { id: dto.roleId } });
    if (!role) throw new NotFoundException(`Rol con ID ${dto.roleId} no encontrado`);

    // validación simple (mejor con class-validator)
    if (!dto.password || dto.password.length < 8) {
      throw new BadRequestException("Password muy corta (mínimo 8)");
    }

    const newUser = this.usersRepository.create({
      username: dto.username,
      email: dto.email,
      password: await hash(dto.password, 10),
      role,
      isActive: true,
    });

    return this.usersRepository.save(newUser);
  }

  // ✅ NO rol, NO email aquí
  async updateUser(id: number, dto: UpdateUserDto) {
    const user = await this.usersRepository.findOne({ where: { id }, relations: ["role"] });
    if (!user) throw new NotFoundException(`Usuario ${id} no encontrado`);

    if (dto.username !== undefined) user.username = dto.username;

    return this.usersRepository.save(user);
  }

  async adminSetPassword(id: number, password: string) {
    if (!password || password.length < 8) {
      throw new BadRequestException("Password muy corta (mínimo 8)");
    }

    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`Usuario ${id} no encontrado`);

    user.password = await hash(password, 10);
    await this.usersRepository.save(user);

    return { ok: true };
  }

  async setActive(id: number, isActive: boolean) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`Usuario ${id} no encontrado`);
    user.isActive = isActive;
    await this.usersRepository.save(user);
    return { ok: true, isActive };
  }

  async requestEmailChange(userId: number, newEmail: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(`Usuario ${userId} no encontrado`);

    // no permitir duplicados
    const exists = await this.usersRepository.findOne({ where: { email: newEmail } });
    if (exists) throw new BadRequestException("Ese email ya está en uso");

    const token = uuidv4();
    const expires = new Date();
    expires.setHours(expires.getHours() + 24);

    user.pendingEmail = newEmail;
    user.emailChangeToken = token;
    user.emailChangeTokenExpiresAt = expires;
    await this.usersRepository.save(user);

    const confirmLink = `${process.env.APP_URL}/confirm-email-change?token=${token}`;

    await this.emailService.sendConfirmEmailChange(newEmail, confirmLink);

    return { ok: true };
  }

  async confirmEmailChange(token: string) {
    const user = await this.usersRepository.findOne({ where: { emailChangeToken: token } });
    if (!user) throw new UnauthorizedException("Token inválido");

    if (!user.emailChangeTokenExpiresAt || user.emailChangeTokenExpiresAt.getTime() < Date.now()) {
      user.emailChangeToken = null;
      user.emailChangeTokenExpiresAt = null;
      user.pendingEmail = null;
      await this.usersRepository.save(user);
      throw new UnauthorizedException("Token expirado");
    }

    if (!user.pendingEmail) throw new BadRequestException("No hay email pendiente");

    // seguridad extra: que no haya colisión
    const collision = await this.usersRepository.findOne({ where: { email: user.pendingEmail } });
    if (collision) throw new BadRequestException("Ese email ya está en uso");

    user.email = user.pendingEmail;
    user.pendingEmail = null;
    user.emailChangeToken = null;
    user.emailChangeTokenExpiresAt = null;

    await this.usersRepository.save(user);
    return { ok: true };
  }
}
