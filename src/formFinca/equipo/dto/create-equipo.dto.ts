import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

export class CreateEquipoDto {
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString({ message: 'El nombre debe ser un texto' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  nombre: string;

  @IsNotEmpty({ message: 'El número de aparatos es obligatorio' })
  @IsInt({ message: 'El número de aparatos debe ser un entero' })
  @Min(0, { message: 'El número de aparatos no puede ser negativo' })
  noAparatos: number;

  @IsNotEmpty({ message: 'El número de bebederos es obligatorio' })
  @IsInt({ message: 'El número de bebederos debe ser un entero' })
  @Min(0, { message: 'El número de bebederos no puede ser negativo' })
  noBebederos: number;

  @IsNotEmpty({ message: 'El número de saleros es obligatorio' })
  @IsInt({ message: 'El número de saleros debe ser un entero' })
  @Min(0, { message: 'El número de saleros no puede ser negativo' })
  noSaleros: number;
}