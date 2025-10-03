import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateAssociateDto {
  @IsOptional()
  @IsString()
  distanciaFinca?: string;

  @IsOptional()
  @IsBoolean()
  viveEnFinca?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  marcaGanado?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  CVO?: string;

  @IsOptional()
  @IsBoolean()
  estado?: boolean;

  @IsOptional()
  @IsInt()
  idNucleoFamiliar?: number;
}