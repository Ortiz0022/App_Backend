import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateHatoDto {
  @IsOptional()
  @IsString({ message: 'El tipo de explotación debe ser un texto' })
  @MaxLength(100, { message: 'El tipo de explotación no puede exceder 100 caracteres' })
  tipoExplotacion?: string;

  @IsOptional()
  @IsInt({ message: 'El total de ganado debe ser un entero' })
  @Min(0, { message: 'El total de ganado no puede ser negativo' })
  totalGanado?: number;

  @IsOptional()
  @IsString({ message: 'La raza predominante debe ser un texto' })
  @MaxLength(100, { message: 'La raza predominante no puede exceder 100 caracteres' })
  razaPredominante?: string;
}