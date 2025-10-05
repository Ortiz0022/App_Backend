import { IsInt, IsOptional, IsPositive } from 'class-validator';

export class UpdateFincaFuenteEnergiaDto {
  @IsOptional()
  @IsInt({ message: 'El ID de la fuente de energía debe ser un entero' })
  @IsPositive({ message: 'El ID de la fuente de energía debe ser positivo' })
  idFuenteEnergia?: number;
}