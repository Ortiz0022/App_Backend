import { IsInt, IsPositive } from 'class-validator';

export class CreateFincaInfraestructuraDto {
  @IsInt()
  @IsPositive()
  idFinca: number;

  @IsInt()
  @IsPositive()
  idInfraestructura: number;
}
