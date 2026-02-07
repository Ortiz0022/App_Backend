import { IsEnum, IsString, MaxLength, ValidateIf } from 'class-validator';
import { SolicitudStatus } from './solicitud-status.enum';

export class ChangeSolicitudStatusDto {
  @IsEnum(SolicitudStatus)
  estado: SolicitudStatus;

  @ValidateIf((o) => o.motivo !== undefined)
  @IsString()
  @MaxLength(255)
  motivo?: string;
}