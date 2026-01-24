// src/modules/solicitud-voluntariado/dto/validate-solicitud-voluntariado.dto.ts
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class ValidateSolicitudVoluntariadoDto {
  @IsString()
  @IsIn(['INDIVIDUAL', 'ORGANIZACION'])
  tipoSolicitante: 'INDIVIDUAL' | 'ORGANIZACION';

  @IsOptional()
  @IsString()
  @MaxLength(60)
  cedula?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  cedulaJuridica?: string;
}
