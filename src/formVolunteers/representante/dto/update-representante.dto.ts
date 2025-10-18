import {
  IsString,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class UpdateRepresentanteDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  cargo?: string;

  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  apellido1?: string;

 @IsOptional()
  @IsString()
  @MaxLength(100)
  apellido2?: string;

  @IsOptional()
  @IsString()
  @MaxLength(15)
  telefono?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  direccion?: string;
}