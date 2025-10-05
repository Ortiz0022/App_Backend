import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateRegistrosProductivosDto {
  @IsOptional()
  @IsBoolean({ message: 'reproductivos debe ser un valor booleano' })
  reproductivos?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'costosProductivos debe ser un valor booleano' })
  costosProductivos?: boolean;
}