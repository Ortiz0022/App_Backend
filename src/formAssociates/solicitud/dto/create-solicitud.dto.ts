import {
  IsArray,
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
import { CreateHatoDto } from 'src/formFinca/hato/dto/create-hato.dto';
import { CreateAnimalDto } from 'src/formFinca/animal/dto/create-animal.dto';
import { CreateForrajeDto } from 'src/formFinca/forraje/dto/create-forraje.dto';
import { CreateRegistrosProductivosDto } from 'src/formFinca/registros-productivos/dto/create-registros-productivos.dto';

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

  @ValidateNested()
  @Type(() => CreateHatoDto)
  @IsOptional()
  hato?: CreateHatoDto;

  @ValidateNested()
  @Type(() => CreateAnimalDto)
  @IsOptional()
  animales?: CreateAnimalDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateForrajeDto)
  forrajes?: CreateForrajeDto[];

  @ValidateNested()
  @Type(() => CreateRegistrosProductivosDto)
  @IsOptional()
  registrosProductivos?: CreateRegistrosProductivosDto;
}