import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, SelectQueryBuilder } from 'typeorm';
import { AuditUser } from './entities/audit-users.entity';
import { FindAuditUsersDto } from './dto/find-audit-users.dto';
import { AuditUserAction } from './dto/audit-users-action.enum';
import { User } from 'src/users/entities/user.entity';

export interface CreateAuditUserLogParams {
  actorUserId?: number | null;
  targetUserId: number;
  actionType: AuditUserAction;
  description?: string | null;
  snapshotBefore?: Record<string, any> | null;
  snapshotAfter?: Record<string, any> | null;
}

export interface LogUserCreateParams {
  actorUserId?: number | null;
  user: User;
}

export interface LogUserUpdateParams {
  actorUserId?: number | null;
  before: User;
  after: User;
}

export interface LogUserDeleteParams {
  actorUserId?: number | null;
  user: User;
}

export interface LogUserActivateParams {
  actorUserId?: number | null;
  before: User;
  after: User;
}

export interface LogUserDeactivateParams {
  actorUserId?: number | null;
  before: User;
  after: User;
}

export interface LogUserPasswordChangedParams {
  actorUserId?: number | null;
  user: User;
}

export interface LogUserEmailChangeRequestedParams {
  actorUserId?: number | null;
  user: User;
  oldEmail?: string | null;
  newEmail?: string | null;
}

export interface LogUserEmailChangeConfirmedParams {
  actorUserId?: number | null;
  before: User;
  after: User;
}

@Injectable()
export class AuditUsersService {
  constructor(
    @InjectRepository(AuditUser)
    private readonly auditUsersRepository: Repository<AuditUser>,
  ) {}

  async createLog(
    params: CreateAuditUserLogParams,
    manager?: EntityManager,
  ): Promise<AuditUser> {
    const repo = manager
      ? manager.getRepository(AuditUser)
      : this.auditUsersRepository;

    const log = repo.create({
      actorUser: params.actorUserId ? ({ id: params.actorUserId } as User) : null,
      targetUser: { id: params.targetUserId } as User,
      actionType: params.actionType,
      description: params.description ?? null,
      snapshotBefore: params.snapshotBefore ?? null,
      snapshotAfter: params.snapshotAfter ?? null,
    });

    return repo.save(log);
  }

private buildUserSnapshot(user: User | null | undefined): Record<string, any> | null {
  if (!user) return null;

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    isActive: user.isActive,
    roleId: user.role?.id ?? null,
    pendingEmail: user.pendingEmail ?? null,
    hasResetPasswordToken: !!user.resetPasswordToken,
    resetPasswordTokenExpiresAt: user.resetPasswordTokenExpiresAt ?? null,
    hasEmailChangeToken: !!user.emailChangeToken,
    emailChangeTokenExpiresAt: user.emailChangeTokenExpiresAt ?? null,
  };
}

  async logUserCreate(
    params: LogUserCreateParams,
    manager?: EntityManager,
  ): Promise<AuditUser> {
    const { actorUserId, user } = params;

    return this.createLog(
      {
        actorUserId,
        targetUserId: user.id,
        actionType: AuditUserAction.USER_CREATED,
        description: 'Creación de usuario',
        snapshotBefore: null,
        snapshotAfter: this.buildUserSnapshot(user),
      },
      manager,
    );
  }

  async logUserUpdate(
    params: LogUserUpdateParams,
    manager?: EntityManager,
  ): Promise<AuditUser> {
    const { actorUserId, before, after } = params;

    return this.createLog(
      {
        actorUserId,
        targetUserId: after.id,
        actionType: AuditUserAction.USER_UPDATED,
        description: 'Actualización de usuario',
        snapshotBefore: this.buildUserSnapshot(before),
        snapshotAfter: this.buildUserSnapshot(after),
      },
      manager,
    );
  }

  async logUserDelete(
    params: LogUserDeleteParams,
    manager?: EntityManager,
  ): Promise<AuditUser> {
    const { actorUserId, user } = params;

    return this.createLog(
      {
        actorUserId,
        targetUserId: user.id,
        actionType: AuditUserAction.USER_DELETED,
        description: 'Eliminación de usuario',
        snapshotBefore: this.buildUserSnapshot(user),
        snapshotAfter: null,
      },
      manager,
    );
  }

  async logUserActivate(
    params: LogUserActivateParams,
    manager?: EntityManager,
  ): Promise<AuditUser> {
    const { actorUserId, before, after } = params;

    return this.createLog(
      {
        actorUserId,
        targetUserId: after.id,
        actionType: AuditUserAction.USER_ACTIVATED,
        description: 'Activación de usuario',
        snapshotBefore: this.buildUserSnapshot(before),
        snapshotAfter: this.buildUserSnapshot(after),
      },
      manager,
    );
  }

  async logUserDeactivate(
    params: LogUserDeactivateParams,
    manager?: EntityManager,
  ): Promise<AuditUser> {
    const { actorUserId, before, after } = params;

    return this.createLog(
      {
        actorUserId,
        targetUserId: after.id,
        actionType: AuditUserAction.USER_DEACTIVATED,
        description: 'Desactivación de usuario',
        snapshotBefore: this.buildUserSnapshot(before),
        snapshotAfter: this.buildUserSnapshot(after),
      },
      manager,
    );
  }

  async logUserPasswordChanged(
    params: LogUserPasswordChangedParams,
    manager?: EntityManager,
  ): Promise<AuditUser> {
    const { actorUserId, user } = params;

    return this.createLog(
      {
        actorUserId,
        targetUserId: user.id,
        actionType: AuditUserAction.USER_PASSWORD_CHANGED,
        description: 'Cambio de contraseña de usuario',
        snapshotBefore: null,
        snapshotAfter: {
          id: user.id,
          email: (user as any).email ?? null,
          passwordChangedAt: new Date().toISOString(),
        },
      },
      manager,
    );
  }

  async logUserEmailChangeRequested(
    params: LogUserEmailChangeRequestedParams,
    manager?: EntityManager,
  ): Promise<AuditUser> {
    const { actorUserId, user, oldEmail, newEmail } = params;

    return this.createLog(
      {
        actorUserId,
        targetUserId: user.id,
        actionType: AuditUserAction.USER_EMAIL_CHANGE_REQUESTED,
        description: 'Solicitud de cambio de correo electrónico',
        snapshotBefore: {
          id: user.id,
          email: oldEmail ?? (user as any).email ?? null,
        },
        snapshotAfter: {
          id: user.id,
          email: newEmail ?? null,
        },
      },
      manager,
    );
  }

  async logUserEmailChangeConfirmed(
    params: LogUserEmailChangeConfirmedParams,
    manager?: EntityManager,
  ): Promise<AuditUser> {
    const { actorUserId, before, after } = params;

    return this.createLog(
      {
        actorUserId,
        targetUserId: after.id,
        actionType: AuditUserAction.USER_EMAIL_CHANGE_CONFIRMED,
        description: 'Confirmación de cambio de correo electrónico',
        snapshotBefore: this.buildUserSnapshot(before),
        snapshotAfter: this.buildUserSnapshot(after),
      },
      manager,
    );
  }

  async findAll(filters: FindAuditUsersDto): Promise<AuditUser[]> {
    const qb = this.auditUsersRepository
      .createQueryBuilder('audit')
      .leftJoinAndSelect('audit.actorUser', 'actorUser')
      .leftJoinAndSelect('audit.targetUser', 'targetUser')
      .orderBy('audit.createdAt', 'DESC');

    this.applyFilters(qb, filters);

    return qb.getMany();
  }

  async findOne(id: number): Promise<AuditUser> {
    const log = await this.auditUsersRepository.findOne({
      where: { id },
      relations: ['actorUser', 'targetUser'],
    });

    if (!log) {
      throw new NotFoundException(`Registro de auditoría de usuario ${id} no encontrado`);
    }

    return log;
  }

  private applyFilters(
    qb: SelectQueryBuilder<AuditUser>,
    filters: FindAuditUsersDto,
  ) {
    if (filters.actorUserId !== undefined) {
      qb.andWhere('actorUser.id = :actorUserId', {
        actorUserId: filters.actorUserId,
      });
    }

    if (filters.targetUserId !== undefined) {
      qb.andWhere('targetUser.id = :targetUserId', {
        targetUserId: filters.targetUserId,
      });
    }

    if (filters.actionType) {
      qb.andWhere('audit.actionType = :actionType', {
        actionType: filters.actionType,
      });
    }

    if (filters.from) {
      qb.andWhere('audit.createdAt >= :from', {
        from: `${filters.from} 00:00:00`,
      });
    }

    if (filters.to) {
      qb.andWhere('audit.createdAt <= :to', {
        to: `${filters.to} 23:59:59`,
      });
    }
  }
}