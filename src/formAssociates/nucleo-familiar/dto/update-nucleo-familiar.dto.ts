
import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateNucleoFamiliarDto {
    @IsInt({ message: 'El número de hombres debe ser un entero' })
    @Min(0, { message: 'El número de hombres no puede ser negativo' })
    nucleoHombres: number;
    @IsInt({ message: 'El número de mujeres debe ser un entero' })
    @Min(0, { message: 'El número de mujeres no puede ser negativo' })
    nucleoMujeres: number;
    @IsInt({ message: 'El ID del asociado debe ser un entero' })
    idAsociado: number;
}