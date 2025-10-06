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

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  areaHa: string; 

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  numeroPlano: string;
}