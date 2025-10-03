import { IsEnum, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';
import { AssociateStatus } from './associate-status.enum';

export class ChangeStatusDto {
  @IsEnum(AssociateStatus)
  estado: AssociateStatus;

  // Motivo es requerido solo si el estado es RECHAZADO
  @ValidateIf(o => o.estado === AssociateStatus.RECHAZADO)
  @IsString()
  @MaxLength(255)
  motivo: string;
}