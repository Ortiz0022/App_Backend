import { IsInt, IsNotEmpty, IsPositive, IsString, MaxLength, Matches } from 'class-validator';

export class CreateForrajeDto {
  @IsInt()
  @IsPositive()
  idFinca: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  tipoForraje: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  variedad: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\d+(\.\d{1,2})?$/, {
    message: 'Hectáreas debe ser un número decimal válido',
  })
  hectareas: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  utilizacion: string;
}