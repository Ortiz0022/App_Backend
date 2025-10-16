import { IsInt, IsNotEmpty, IsPositive, IsString, MaxLength, Min } from 'class-validator';

export class CreateAnimalDto {
  @IsInt()
  @IsPositive()
  idHato: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  nombre: string;

  @IsInt()  
  @Min(1, { message: 'La cantidad debe ser al menos 1' })
  cantidad: number;
}