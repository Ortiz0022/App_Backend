import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePersonaDto } from 'src/formAssociates/persona/dto/create-persona.dto';
import { DatosAsociadoDto } from 'src/formAssociates/associate/dto/associate-data.dto';
import { DatosFincaDto } from 'src/formFinca/finca/dto/finca-data.dto';

export class CreateSolicitudDto {
  @ValidateNested()
  @Type(() => CreatePersonaDto)
  persona: CreatePersonaDto;

  @ValidateNested()
  @Type(() => DatosAsociadoDto)
  datosAsociado: DatosAsociadoDto;

  @ValidateNested()
  @Type(() => DatosFincaDto)
  datosFinca: DatosFincaDto;  
}