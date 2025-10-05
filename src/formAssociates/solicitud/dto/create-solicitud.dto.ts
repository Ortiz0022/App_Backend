import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  Validate,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePersonaDto } from 'src/formAssociates/persona/dto/create-persona.dto';
import { DatosAsociadoDto } from 'src/formAssociates/associate/dto/associate-data.dto';
import { DatosFincaDto } from 'src/formFinca/finca/dto/finca-data.dto';
import { NucleoFamiliarDto } from 'src/formAssociates/nucleo-familiar/dto/nucleo-familiar-data.dto';
import { CreatePropietarioDto } from 'src/formAssociates/propietario/dto/create-propietario.dto';
import { PropietarioConditionalValidator } from '../validators/popietario-conditional.validator';

export class CreateSolicitudDto {
  @ValidateNested()
  @Type(() => CreatePersonaDto)
  persona: CreatePersonaDto;

  @ValidateNested()
  @Type(() => DatosAsociadoDto)
  datosAsociado: DatosAsociadoDto;

  @ValidateNested()
  @Type(() => CreatePropietarioDto)
  @IsOptional()
  @Validate(PropietarioConditionalValidator)
  propietario?: CreatePropietarioDto;

  @ValidateNested()
  @Type(() => NucleoFamiliarDto)
  @IsOptional()
  nucleoFamiliar?: NucleoFamiliarDto;

  @ValidateNested()
  @Type(() => DatosFincaDto)
  datosFinca: DatosFincaDto;  
}