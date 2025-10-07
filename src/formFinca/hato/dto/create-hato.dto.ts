import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, MaxLength, Min } from 'class-validator';

export class CreateHatoDto {
  @IsInt()
  @IsPositive()
  idFinca: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  tipoExplotacion: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  totalGanado?: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  razaPredominante: string;
}