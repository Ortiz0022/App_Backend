import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateFuenteEnergiaDto {
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString({ message: 'El nombre debe ser un texto' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  nombre: string;
}