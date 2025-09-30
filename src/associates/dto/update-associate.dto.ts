import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, Length, MaxLength } from 'class-validator';
import { AssociateStatus } from './associate-status.enum';

export class UpdateAssociateDto {
  @IsString() 
  @MaxLength(30) 
  nombre?: string;

  @IsString() 
  @MaxLength(30) 
  apellido1?: string;

  @IsString() 
  @MaxLength(30) 
  apellido2?: string;

  @IsString() @Length(8, 12)
  telefono?: string;

  @IsEmail() @MaxLength(100)
  email?: string;

  @IsOptional() @IsString() @MaxLength(255)
  direccion?: string;

  @IsOptional() @IsString()
  distanciaFinca?: string; // decimal(5,2) como string

  @IsBoolean()
  viveEnFinca?: boolean;

  @IsOptional() @IsString() @MaxLength(100)
  marcaGanado?: string;

  @IsOptional() @IsString() @MaxLength(100)
  CVO?: string;

  // Opcional: si viene desde admin puedes forzar estado; en front público no lo envíes
  @IsOptional() @IsEnum(AssociateStatus)
  estado?: AssociateStatus;

  @IsOptional() @IsString() @MaxLength(255)
  motivoRechazo?: string;
}
