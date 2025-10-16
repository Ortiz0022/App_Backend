import {
  IsString,
  IsInt,
  IsEmail,
  IsOptional,
  MaxLength,
  MinLength,
  Min,
} from 'class-validator';

export class UpdateOrganizacionDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  cedulaJuridica?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombre?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  numeroVoluntarios?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  direccion?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(15)
  telefono?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  tipoOrganizacion?: string;
}