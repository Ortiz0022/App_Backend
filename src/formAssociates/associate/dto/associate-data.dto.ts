import { IsBoolean, IsOptional, IsString, MaxLength } from "class-validator";

export class DatosAsociadoDto {
  @IsOptional()
  @IsString()
  distanciaFinca?: string;

  @IsBoolean()
  viveEnFinca: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  marcaGanado?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  CVO?: string;

  @IsBoolean()
  esPropietario: boolean;
}