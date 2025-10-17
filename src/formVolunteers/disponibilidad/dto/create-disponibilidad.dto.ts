import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsDateString,
} from 'class-validator';

export class CreateDisponibilidadDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  tipoEntidad: string;

  @IsDateString()
  @IsNotEmpty()
  fechaInicio: string;

  @IsDateString()
  @IsNotEmpty()
  fechaFin: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  dias: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  horario: string;
}