import {
    IsDateString,
    IsEmail,
    IsNumberString,
    IsOptional,
    IsString,
    Length,
    MaxLength,
  } from 'class-validator';
  
  export class CreatePersonaDto {
    @IsNumberString()
    @Length(8, 12)
    cedula: string;
  
    @IsString()
    @MaxLength(30)
    nombre: string;
  
    @IsString()
    @MaxLength(30)
    apellido1: string;
  
    @IsString()
    @MaxLength(30)
    apellido2: string;
  
    @IsDateString()
    fechaNacimiento: string;
  
    @IsString()
    @Length(8, 12)
    telefono: string;
  
    @IsEmail()
    @MaxLength(100)
    email: string;
  
    @IsOptional()
    @IsString()
    @MaxLength(255)
    direccion?: string;
  }