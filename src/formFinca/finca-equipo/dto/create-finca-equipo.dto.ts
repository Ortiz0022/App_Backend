import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class CreateFincaEquipoDto {
  @IsNotEmpty({ message: 'El ID de la finca es obligatorio' })
  @IsInt({ message: 'El ID de la finca debe ser un entero' })
  @IsPositive({ message: 'El ID de la finca debe ser positivo' })
  idFinca: number;

  @IsNotEmpty({ message: 'El ID del equipo es obligatorio' })
  @IsInt({ message: 'El ID del equipo debe ser un entero' })
  @IsPositive({ message: 'El ID del equipo debe ser positivo' })
  idEquipo: number;
}