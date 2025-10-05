import { IsInt, IsNotEmpty, IsPositive, IsString, MaxLength } from 'class-validator';

export class CreateCanalDto {
  @IsInt()
  @IsPositive()
  idFinca: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;
}
