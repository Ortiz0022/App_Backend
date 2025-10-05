import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateAnimalDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  nombre?: string;

  @IsOptional()
  @IsInt({ message: 'La edad debe ser un entero' })
  @Min(0, { message: 'La edad no puede ser negativa' })
  edad?: number;
}