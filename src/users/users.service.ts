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
import { AuditUsersService } from "src/audit/auditUsers/audit-users.service";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Role) private roleRepository: Repository<Role>,
    private readonly emailService: EmailService,
    private readonly auditUsersService: AuditUsersService,
  ) {}

  async findAllUsers() {
    return this.usersRepository.find({ relations: ["role"] });
  }

  async findOneUser(id: number) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ["role"],
    });

    if (!user) throw new NotFoundException(`Usuario ${id} no encontrado`);
    return user;
  }

  async createUser(dto: CreateUserDto, actorUserId?: number | null) {
    const role = await this.roleRepository.findOne({ where: { id: dto.roleId } });
    if (!role) throw new NotFoundException(`Rol con ID ${dto.roleId} no encontrado`);

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

    const savedUser = await this.usersRepository.save(newUser);

    const savedUserWithRole = await this.usersRepository.findOne({
      where: { id: savedUser.id },
      relations: ["role"],
    });

    if (savedUserWithRole) {
      await this.auditUsersService.logUserCreate({
        actorUserId: actorUserId ?? null,
        user: savedUserWithRole,
      });
    }

    return savedUser;
  }

  async updateUser(id: number, dto: UpdateUserDto, actorUserId?: number | null) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ["role"],
    });

    if (!user) throw new NotFoundException(`Usuario ${id} no encontrado`);

    const before = {
      ...user,
      role: user.role ? { ...user.role } : null,
    } as User;

    if (dto.username !== undefined) user.username = dto.username;

    const updated = await this.usersRepository.save(user);

    const updatedWithRole = await this.usersRepository.findOne({
      where: { id: updated.id },
      relations: ["role"],
    });

    if (updatedWithRole) {
      await this.auditUsersService.logUserUpdate({
        actorUserId: actorUserId ?? null,
        before,
        after: updatedWithRole,
      });
    }

    return updated;
  }

  async adminSetPassword(id: number, password: string, actorUserId?: number | null) {
    if (!password || password.length < 8) {
      throw new BadRequestException("Password muy corta (mínimo 8)");
    }

    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ["role"],
    });

    if (!user) throw new NotFoundException(`Usuario ${id} no encontrado`);

    user.password = await hash(password, 10);
    await this.usersRepository.save(user);

    await this.auditUsersService.logUserPasswordChanged({
      actorUserId: actorUserId ?? null,
      user,
    });

    return { ok: true };
  }

  async setActive(id: number, isActive: boolean, actorUserId?: number | null) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ["role"],
    });

    if (!user) throw new NotFoundException(`Usuario ${id} no encontrado`);

    const before = {
      ...user,
      role: user.role ? { ...user.role } : null,
    } as User;

    user.isActive = isActive;
    const updated = await this.usersRepository.save(user);

    const updatedWithRole = await this.usersRepository.findOne({
      where: { id: updated.id },
      relations: ["role"],
    });

    if (updatedWithRole) {
      if (isActive) {
        await this.auditUsersService.logUserActivate({
          actorUserId: actorUserId ?? null,
          before,
          after: updatedWithRole,
        });
      } else {
        await this.auditUsersService.logUserDeactivate({
          actorUserId: actorUserId ?? null,
          before,
          after: updatedWithRole,
        });
      }
    }

    return { ok: true, isActive };
  }

  async requestEmailChange(userId: number, newEmail: string, actorUserId?: number | null) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ["role"],
    });

    if (!user) throw new NotFoundException(`Usuario ${userId} no encontrado`);

    const exists = await this.usersRepository.findOne({ where: { email: newEmail } });
    if (exists) throw new BadRequestException("Ese email ya está en uso");

    const before = {
      ...user,
      role: user.role ? { ...user.role } : null,
    } as User;

    const token = uuidv4();
    const expires = new Date();
    expires.setHours(expires.getHours() + 24);

    user.pendingEmail = newEmail;
    user.emailChangeToken = token;
    user.emailChangeTokenExpiresAt = expires;
    await this.usersRepository.save(user);

    const after = await this.usersRepository.findOne({
      where: { id: user.id },
      relations: ["role"],
    });

    if (after) {
      await this.auditUsersService.logUserEmailChangeRequested({
        actorUserId: actorUserId ?? null,
        user: after,
        oldEmail: before.email,
        newEmail,
      });
    }

    const confirmLink = `${process.env.APP_URL}/confirm-email-change?token=${token}`;
    await this.emailService.sendConfirmEmailChange(newEmail, confirmLink);

    return { ok: true };
  }

  async confirmEmailChange(token: string) {
    const user = await this.usersRepository.findOne({
      where: { emailChangeToken: token },
      relations: ["role"],
    });

    if (!user) throw new UnauthorizedException("Token inválido");

    if (!user.emailChangeTokenExpiresAt || user.emailChangeTokenExpiresAt.getTime() < Date.now()) {
      user.emailChangeToken = null;
      user.emailChangeTokenExpiresAt = null;
      user.pendingEmail = null;
      await this.usersRepository.save(user);
      throw new UnauthorizedException("Token expirado");
    }

    if (!user.pendingEmail) throw new BadRequestException("No hay email pendiente");

    const collision = await this.usersRepository.findOne({
      where: { email: user.pendingEmail },
    });
    if (collision) throw new BadRequestException("Ese email ya está en uso");

    const before = {
      ...user,
      role: user.role ? { ...user.role } : null,
    } as User;

    user.email = user.pendingEmail;
    user.pendingEmail = null;
    user.emailChangeToken = null;
    user.emailChangeTokenExpiresAt = null;

    await this.usersRepository.save(user);

    const after = await this.usersRepository.findOne({
      where: { id: user.id },
      relations: ["role"],
    });

    if (after) {
      await this.auditUsersService.logUserEmailChangeConfirmed({
        actorUserId: user.id,
        before,
        after,
      });
    }

    return { ok: true };
  }
}