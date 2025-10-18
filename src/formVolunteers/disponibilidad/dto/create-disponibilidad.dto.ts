
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsDateString,
  IsArray,
  IsOptional,
} from 'class-validator';

export class CreateDisponibilidadDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  tipoEntidad?: string; // Hacerlo opcional porque se asigna automáticamente

  @IsDateString()
  @IsNotEmpty()
  fechaInicio: string;

  @IsDateString()
  @IsNotEmpty()
  fechaFin: string;

  // ✅ CAMBIO: Aceptar array de strings en lugar de string único
  @IsArray()
  @IsString({ each: true })
  dias: string[];

  // ✅ CAMBIO: Aceptar array de strings en lugar de string único
  @IsArray()
  @IsString({ each: true })
  horarios: string[];
}