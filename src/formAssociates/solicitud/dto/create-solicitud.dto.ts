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
import { CreateFuenteAguaDto } from 'src/formFinca/fuente-agua/dto/create-fuente-agua';
import { CreateMetodoRiegoDto } from 'src/formFinca/metodo-riego/dto/create-metodo-riego.dto';
import { CreateActividadDto } from 'src/formFinca/actividad-agropecuaria/dto/create-actividad';
import { CreateInfraestructuraProduccionDto } from 'src/formFinca/equipo/dto/create-equipo.dto';
import { CreateFincaOtroEquipoDto } from 'src/formFinca/otros-equipos/dto/create-otros-equipos.dto';
import { CreateTipoCercaDto } from 'src/formFinca/tipo-cerca/dto/create-tipo-cerca.dto';
import { CreateFincaInfraestructuraDto } from 'src/formFinca/finca-infraestructura/dto/create-fincaInfraestructura.dto';
import { CreateCorrienteDto } from 'src/formFinca/corriente-electrica/dto/create-corriente.dto';
import { CreateAccesoDto } from 'src/formFinca/acceso/dto/create-acceso.dto';

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

  @ValidateNested()
  @Type(() => CreateFuenteAguaDto)
  @IsOptional()
  fuentesAgua?: CreateFuenteAguaDto[];

  @ValidateNested()
  @Type(() => CreateMetodoRiegoDto)
  @IsOptional()
  metodosRiego?: CreateMetodoRiegoDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateActividadDto)
  actividades?: CreateActividadDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateInfraestructuraProduccionDto)
  infraestructuraProduccion?: CreateInfraestructuraProduccionDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFincaOtroEquipoDto)
  otrosEquipos?: CreateFincaOtroEquipoDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateTipoCercaDto)
  tipoCerca?: CreateTipoCercaDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFincaInfraestructuraDto)
  infraestructuras?: CreateFincaInfraestructuraDto[];

  @ValidateNested()
  @Type(() => CreateCorrienteDto)
  @IsOptional()
  corrienteElectrica?: CreateCorrienteDto; 

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAccesoDto)
  @IsOptional()
  accesos?: CreateAccesoDto[];
}
