import { IsInt, IsOptional, IsPositive } from 'class-validator';

export class UpdateFincaEquipoDto {
  @IsOptional()
  @IsInt({ message: 'El ID del equipo debe ser un entero' })
  @IsPositive({ message: 'El ID del equipo debe ser positivo' })
  idEquipo?: number;
}