// src/auth/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
export const ROLES_KEY = 'ROLES';
export type AppRole = 'ADMIN' | 'JUNTA';
export const Roles = (...roles: AppRole[]) => SetMetadata(ROLES_KEY, roles);
