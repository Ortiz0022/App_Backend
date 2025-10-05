import { IsInt, IsNotEmpty, IsPositive, IsString, MaxLength } from 'class-validator';

export class CreateActividadDto {
  @IsInt()
  @IsPositive()
  idFinca: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string; // Ej: Lechería, Engorde, Hortalizas, Café, etc.
}
