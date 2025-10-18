import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateVoluntarioIndividualDto {
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
  @MaxLength(500)
  motivacion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  habilidades?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  experiencia?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  nacionalidad?: string;

  @IsOptional()
    @IsBoolean()
    isActive?: boolean;

}