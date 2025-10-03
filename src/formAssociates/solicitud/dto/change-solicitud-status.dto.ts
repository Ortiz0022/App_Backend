import { IsEnum, IsString, MaxLength, ValidateIf } from 'class-validator';
import { SolicitudStatus } from './solicitud-status.enum';

export class ChangeSolicitudStatusDto {
  @IsEnum(SolicitudStatus)
  estado: SolicitudStatus;

  @ValidateIf((o) => o.estado === SolicitudStatus.RECHAZADO)
  @IsString()
  @MaxLength(255)
  motivo?: string;
}