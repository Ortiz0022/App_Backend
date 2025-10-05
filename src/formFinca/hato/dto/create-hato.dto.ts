import { IsInt, IsNotEmpty, IsPositive, IsString, MaxLength, Min } from 'class-validator';

export class CreateHatoDto {
  @IsNotEmpty({ message: 'El tipo de explotación es obligatorio' })
  @IsString({ message: 'El tipo de explotación debe ser un texto' })
  @MaxLength(100, { message: 'El tipo de explotación no puede exceder 100 caracteres' })
  tipoExplotacion: string;

  @IsNotEmpty({ message: 'El total de ganado es obligatorio' })
  @IsInt({ message: 'El total de ganado debe ser un entero' })
  @Min(0, { message: 'El total de ganado no puede ser negativo' })
  totalGanado: number;

  @IsNotEmpty({ message: 'La raza predominante es obligatoria' })
  @IsString({ message: 'La raza predominante debe ser un texto' })
  @MaxLength(100, { message: 'La raza predominante no puede exceder 100 caracteres' })
  razaPredominante: string;

  @IsNotEmpty({ message: 'El ID de la finca es obligatorio' })
  @IsInt({ message: 'El ID de la finca debe ser un entero' })
  @IsPositive({ message: 'El ID de la finca debe ser positivo' })
  idFinca: number;
}