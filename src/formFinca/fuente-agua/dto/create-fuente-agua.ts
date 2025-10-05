import { IsInt, IsNotEmpty, IsPositive, IsString, MaxLength } from 'class-validator';

export class CreateFuenteAguaDto {
  @IsInt()
  @IsPositive()
  idFinca: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string; // Ej: Pozo, Quebrada, Naciente, Acueducto, etc.
}
