import {
  IsString,
  IsOptional,
  MaxLength,
  IsDateString,
  IsArray,
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

  // ✅ CAMBIO: De string a array de strings
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dias?: string[];

  // ✅ CAMBIO: De string a array de strings (y cambiar de "horario" a "horarios")
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  horarios?: string[];
}