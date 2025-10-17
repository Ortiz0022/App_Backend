import {
  IsString,
  IsOptional,
  MaxLength,
  IsDateString,
} from 'class-validator';

export class UpdateDisponibilidadDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  tipoEntidad?: string;

  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  dias?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  horario?: string;
}