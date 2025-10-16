import {
  IsString,
  IsInt,
  IsEmail,
  IsNotEmpty,
  MaxLength,
  MinLength,
  Min,
} from 'class-validator';

export class CreateOrganizacionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  cedulaJuridica: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @IsInt()
  @Min(1)
  numeroVoluntarios: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  direccion: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(15)
  telefono: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(100)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  tipoOrganizacion: string;
}