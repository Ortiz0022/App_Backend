import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateEquipoDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  nombre?: string;

  @IsOptional()
  @IsInt({ message: 'El número de aparatos debe ser un entero' })
  @Min(0, { message: 'El número de aparatos no puede ser negativo' })
  noAparatos?: number;

  @IsOptional()
  @IsInt({ message: 'El número de bebederos debe ser un entero' })
  @Min(0, { message: 'El número de bebederos no puede ser negativo' })
  noBebederos?: number;

  @IsOptional()
  @IsInt({ message: 'El número de saleros debe ser un entero' })
  @Min(0, { message: 'El número de saleros no puede ser negativo' })
  noSaleros?: number;
}