import { IsEnum, IsInt, IsOptional, IsString, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { AuditBudgetEntity } from './audit-budget-entity.enum';
import { AuditBudgetAction } from './audit-budget-action.enum';
import { AuditBudgetScope } from './audit-budget-scope.enum';

export class FindAuditBudgetDto {
  @IsOptional()
  @IsEnum(AuditBudgetEntity)
  entityType?: AuditBudgetEntity;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  entityId?: number;

  @IsOptional()
  @IsEnum(AuditBudgetAction)
  actionType?: AuditBudgetAction;

  @IsOptional()
  @IsEnum(AuditBudgetScope)
  budgetScope?: AuditBudgetScope;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  actorUserId?: number;

  @IsOptional()
  @IsString()
  subTypeTable?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  subTypeId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  relatedExtraordinaryId?: number;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}