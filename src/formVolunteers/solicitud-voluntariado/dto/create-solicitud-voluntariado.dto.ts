import {
  IsString,
  IsNotEmpty,
  MaxLength,
  ValidateNested,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateVoluntarioIndividualDto } from '../../voluntario-individual/dto/create-voluntario-individual.dto';
import { CreateOrganizacionDto } from '../../organizacion/dto/create-organizacion.dto';

export class CreateSolicitudVoluntariadoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  tipoSolicitante: string;

  @ValidateIf((o) => o.tipoSolicitante === 'INDIVIDUAL')
  @ValidateNested()
  @Type(() => CreateVoluntarioIndividualDto)
  voluntario?: CreateVoluntarioIndividualDto;

  @ValidateIf((o) => o.tipoSolicitante === 'ORGANIZACION')
  @ValidateNested()
  @Type(() => CreateOrganizacionDto)
  organizacion?: CreateOrganizacionDto;
}