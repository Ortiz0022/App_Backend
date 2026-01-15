import { IsInt, IsNotEmpty, IsPositive, Min } from 'class-validator';

export class CreateInfraestructuraProduccionDto {
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  idFinca: number;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  numeroAparatos: number;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  numeroBebederos: number;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  numeroSaleros: number;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  numeroComederos: number;
}