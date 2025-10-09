import { IsInt, IsNotEmpty, IsPositive, IsString, MaxLength, Min, IsIn } from 'class-validator';
import { OTROS_EQUIPOS_VALIDOS } from './otros_equipos_validos';

export class CreateFincaOtroEquipoDto {
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  idFinca: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @IsIn(OTROS_EQUIPOS_VALIDOS, { message: 'Tipo de equipo no válido' })
  nombreEquipo: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  cantidad: number;
}