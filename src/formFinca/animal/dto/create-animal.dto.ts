import { IsInt, IsNotEmpty, IsPositive, IsString, MaxLength, Min } from 'class-validator';

export class CreateAnimalDto {
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString({ message: 'El nombre debe ser un texto' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  nombre: string;

  @IsNotEmpty({ message: 'La edad es obligatoria' })
  @IsInt({ message: 'La edad debe ser un entero' })
  @Min(0, { message: 'La edad no puede ser negativa' })
  edad: number;

  @IsNotEmpty({ message: 'El ID del hato es obligatorio' })
  @IsInt({ message: 'El ID del hato debe ser un entero' })
  @IsPositive({ message: 'El ID del hato debe ser positivo' })
  idHato: number;
}