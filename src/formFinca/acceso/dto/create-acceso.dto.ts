import { IsInt, IsNotEmpty, IsPositive, IsString, MaxLength } from 'class-validator';

export class CreateAccesoDto {
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString({ message: 'El nombre debe ser un texto' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  nombre: string;

  @IsNotEmpty({ message: 'El ID de la finca es obligatorio' })
  @IsInt({ message: 'El ID de la finca debe ser un entero' })
  @IsPositive({ message: 'El ID de la finca debe ser positivo' })
  idFinca: number;
}