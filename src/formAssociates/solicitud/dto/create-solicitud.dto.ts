import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePersonaDto } from 'src/formAssociates/persona/dto/create-persona.dto';

export class DatosAsociadoDto {
  @IsOptional()
  @IsString()
  distanciaFinca?: string;

  @IsBoolean()
  viveEnFinca: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  marcaGanado?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  CVO?: string;
}

export class CreateSolicitudDto {
  @ValidateNested()
  @Type(() => CreatePersonaDto)
  persona: CreatePersonaDto;

  @ValidateNested()
  @Type(() => DatosAsociadoDto)
  datosAsociado: DatosAsociadoDto;
}