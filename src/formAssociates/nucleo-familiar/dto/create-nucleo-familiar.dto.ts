import { IsInt, IsNotEmpty, IsPositive, Min } from 'class-validator';

export class CreateNucleoFamiliarDto {
  @IsNotEmpty({ message: 'El número de hombres es obligatorio' })
  @IsInt({ message: 'El número de hombres debe ser un entero' })
  @Min(0, { message: 'El número de hombres no puede ser negativo' })
  nucleoHombres: number;

  @IsNotEmpty({ message: 'El número de mujeres es obligatorio' })
  @IsInt({ message: 'El número de mujeres debe ser un entero' })
  @Min(0, { message: 'El número de mujeres no puede ser negativo' })
  nucleoMujeres: number;

  @IsNotEmpty({ message: 'El ID del asociado es obligatorio' })
  @IsInt({ message: 'El ID del asociado debe ser un entero' })
  @IsPositive({ message: 'El ID del asociado debe ser positivo' })
  idAsociado: number;
}