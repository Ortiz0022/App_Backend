import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateFincaDto {
  @IsInt()
  @IsPositive()
  idAsociado: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01, { message: 'El área debe ser mayor a 0' })
  areaHa: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  numeroPlano: string;
}