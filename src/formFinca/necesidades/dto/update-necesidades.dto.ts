import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateNecesidadesDto {
  @IsOptional()
  @IsInt({ message: 'El orden debe ser un entero' })
  @Min(1, { message: 'El orden debe ser al menos 1' })
  orden?: number;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  @MaxLength(255, { message: 'La descripción no puede exceder 255 caracteres' })
  descripcion?: string;
}