import { IsEnum, IsString, MaxLength, ValidateIf } from 'class-validator';
import { SolicitudVoluntariadoStatus } from './solicitud-voluntariado-status.enum';

export class ChangeSolicitudVoluntariadoStatusDto {
  @IsEnum(SolicitudVoluntariadoStatus)
  estado: SolicitudVoluntariadoStatus;

  @ValidateIf((o) => o.motivo !== undefined)
  @IsString()
  @MaxLength(255)
  motivo?: string;
}