import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateFuenteEnergiaDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  nombre?: string;
}