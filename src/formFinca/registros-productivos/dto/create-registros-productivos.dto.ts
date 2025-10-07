import { IsBoolean, IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class CreateRegistrosProductivosDto {
  @IsInt()
  @IsPositive()
  idFinca: number;

  @IsBoolean()
  reproductivos: boolean;

  @IsBoolean()
  costosProductivos: boolean;
}