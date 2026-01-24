import {
  IsString,
  IsNotEmpty,
  MaxLength,
  ValidateNested,
  ValidateIf,
  IsArray,
  IsOptional,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateVoluntarioIndividualDto } from '../../voluntario-individual/dto/create-voluntario-individual.dto';
import { CreateOrganizacionDto } from '../../organizacion/dto/create-organizacion.dto';
import { CreateRepresentanteDto } from '../../representante/dto/create-representante.dto';
import { CreateRazonSocialDto } from '../../razon-social/dto/create-razon-social.dto';
import { CreateDisponibilidadDto } from '../../disponibilidad/dto/create-disponibilidad.dto';
import { CreateAreaInteresDto } from '../../areas-interes/dto/create-area-interes.dto';

export class CreateSolicitudVoluntariadoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
   @IsIn(['INDIVIDUAL', 'ORGANIZACION'])
  tipoSolicitante: 'INDIVIDUAL' | 'ORGANIZACION';

  @ValidateIf((o) => o.tipoSolicitante === 'INDIVIDUAL')
  @ValidateNested()
  @Type(() => CreateVoluntarioIndividualDto)
  voluntario?: CreateVoluntarioIndividualDto;

  @ValidateIf((o) => o.tipoSolicitante === 'ORGANIZACION')
  @ValidateNested()
  @Type(() => CreateOrganizacionDto)
  organizacion?: CreateOrganizacionDto;

  @ValidateIf((o) => o.tipoSolicitante === 'ORGANIZACION')
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRepresentanteDto)
  representantes?: CreateRepresentanteDto[];

  @ValidateIf((o) => o.tipoSolicitante === 'ORGANIZACION')
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRazonSocialDto)
  razonesSociales?: CreateRazonSocialDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDisponibilidadDto)
  disponibilidades?: CreateDisponibilidadDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAreaInteresDto)
  areasInteres?: CreateAreaInteresDto[];
}