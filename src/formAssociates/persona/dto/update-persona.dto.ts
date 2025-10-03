import {
    IsDateString,
    IsEmail,
    IsOptional,
    IsString,
    Length,
    MaxLength,
  } from 'class-validator';
  
  export class UpdatePersonaDto {
    @IsOptional()
    @IsString()
    @MaxLength(30)
    nombre?: string;
  
    @IsOptional()
    @IsString()
    @MaxLength(30)
    apellido1?: string;
  
    @IsOptional()
    @IsString()
    @MaxLength(30)
    apellido2?: string;
  
    @IsOptional()
    @IsDateString()
    fechaNacimiento?: string;
  
    @IsOptional()
    @IsString()
    @Length(8, 12)
    telefono?: string;
  
    @IsOptional()
    @IsEmail()
    @MaxLength(100)
    email?: string;
  
    @IsOptional()
    @IsString()
    @MaxLength(255)
    direccion?: string;
  }