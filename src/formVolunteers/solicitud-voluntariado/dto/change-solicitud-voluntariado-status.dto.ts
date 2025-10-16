import { IsEnum, IsString, MaxLength, ValidateIf } from 'class-validator';
import { SolicitudStatus } from './solicitud-voluntariado-status.enum';

export class ChangeSolicitudVoluntariadoStatusDto {
  @IsEnum(SolicitudStatus)
  estado: SolicitudStatus;

  @ValidateIf((o) => o.estado === SolicitudStatus.RECHAZADO)
  @IsString()
  @MaxLength(255)
  motivo?: string;
}