// src/auth/roles.guard.ts
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, AppRole } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<AppRole[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const req = ctx.switchToHttp().getRequest();
    const role = (req.user?.userRole ?? '').toString().toUpperCase();
    if (!role) throw new ForbiddenException('Rol no presente en el token');

    const ok = required.some(r => r.toUpperCase() === role);
    if (!ok) throw new ForbiddenException('No tienes permisos para esta acción');
    return true;
  }
}
