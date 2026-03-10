import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional } from 'class-validator';
import { AuditUserAction } from './audit-users-action.enum';

export class FindAuditUsersDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  actorUserId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  targetUserId?: number;

  @IsOptional()
  @IsEnum(AuditUserAction)
  actionType?: AuditUserAction;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}