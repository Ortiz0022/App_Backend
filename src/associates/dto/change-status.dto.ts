// dto/change-status.dto.ts
import { IsEnum, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';
import { AssociateStatus } from './associate-status.enum';

export class ChangeStatusDto {
  @IsEnum(AssociateStatus)
  estado: AssociateStatus;

  @ValidateIf(o => o.estado === AssociateStatus.RECHAZADO)
  @IsString()
  @MaxLength(255)
  motivo?: string; // requerido solo si estado=RECHAZADO
}
