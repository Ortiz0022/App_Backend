import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  IsEmail,
  MinLength,
} from 'class-validator';

export class UpdateAssociateDto {
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(12)
  telefono?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  direccion?: string;

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
}