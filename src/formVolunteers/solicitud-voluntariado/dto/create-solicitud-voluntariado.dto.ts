import {
  IsString,
  IsNotEmpty,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateVoluntarioIndividualDto } from '../../voluntario-individual/dto/create-voluntario-individual.dto';

export class CreateSolicitudVoluntariadoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  tipoSolicitante: string;

  @ValidateNested()
  @Type(() => CreateVoluntarioIndividualDto)
  voluntario: CreateVoluntarioIndividualDto;
}