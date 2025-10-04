import { IsInt, IsPositive } from 'class-validator';

export class CreateFincaTipoCercaDto {
  @IsInt()
  @IsPositive()
  idFinca: number;

  @IsInt()
  @IsPositive()
  idTipoCerca: number;
}
