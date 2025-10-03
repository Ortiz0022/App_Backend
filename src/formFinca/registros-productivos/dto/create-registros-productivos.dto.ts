import { IsBoolean, IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class CreateRegistrosProductivosDto {
  @IsNotEmpty({ message: 'El campo reproductivos es obligatorio' })
  @IsBoolean({ message: 'reproductivos debe ser un valor booleano' })
  reproductivos: boolean;

  @IsNotEmpty({ message: 'El campo costosProductivos es obligatorio' })
  @IsBoolean({ message: 'costosProductivos debe ser un valor booleano' })
  costosProductivos: boolean;

  @IsNotEmpty({ message: 'El ID de la finca es obligatorio' })
  @IsInt({ message: 'El ID de la finca debe ser un entero' })
  @IsPositive({ message: 'El ID de la finca debe ser positivo' })
  idFinca: number;
}