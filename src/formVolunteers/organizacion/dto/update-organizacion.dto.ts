import {
  IsString,
  IsInt,
  IsEmail,
  IsOptional,
  IsBoolean,
  MaxLength,
  MinLength,
  Min,
} from 'class-validator';

export class UpdateOrganizacionDto {
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
  @IsBoolean()
  isActive?: boolean;
}