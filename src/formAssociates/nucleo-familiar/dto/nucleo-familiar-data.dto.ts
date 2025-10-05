import { IsInt, Min } from 'class-validator';

export class NucleoFamiliarDto {
    @IsInt({ message: 'El número de hombres debe ser un entero' })
    @Min(0, { message: 'El número de hombres no puede ser negativo' })
    nucleoHombres: number;
  
    @IsInt({ message: 'El número de mujeres debe ser un entero' })
    @Min(0, { message: 'El número de mujeres no puede ser negativo' })
    nucleoMujeres: number;
  }