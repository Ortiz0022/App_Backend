import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class CreateFincaFuenteEnergiaDto {
  @IsNotEmpty({ message: 'El ID de la finca es obligatorio' })
  @IsInt({ message: 'El ID de la finca debe ser un entero' })
  @IsPositive({ message: 'El ID de la finca debe ser positivo' })
  idFinca: number;

  @IsNotEmpty({ message: 'El ID de la fuente de energía es obligatorio' })
  @IsInt({ message: 'El ID de la fuente de energía debe ser un entero' })
  @IsPositive({ message: 'El ID de la fuente de energía debe ser positivo' })
  idFuenteEnergia: number;
}