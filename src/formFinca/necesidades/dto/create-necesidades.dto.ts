import { IsInt, IsNotEmpty, IsPositive, IsString, MaxLength, Min } from 'class-validator';

export class CreateNecesidadesDto {
  @IsNotEmpty({ message: 'El orden es obligatorio' })
  @IsInt({ message: 'El orden debe ser un entero' })
  @Min(1, { message: 'El orden debe ser al menos 1' })
  orden: number;

  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @IsString({ message: 'La descripción debe ser un texto' })
  @MaxLength(255, { message: 'La descripción no puede exceder 255 caracteres' })
  descripcion: string;

  @IsNotEmpty({ message: 'El ID del asociado es obligatorio' })
  @IsInt({ message: 'El ID del asociado debe ser un entero' })
  @IsPositive({ message: 'El ID del asociado debe ser positivo' })
  idAsociado: number;
}