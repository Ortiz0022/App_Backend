import { IsNumber, IsString, MaxLength, Min } from "class-validator";

export class DatosFincaDto {
    @IsString()
    @MaxLength(100)
    nombre: string;
  
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0.01, { message: 'El área debe ser mayor a 0' })
    areaHa: number;
  
    @IsString()
    @MaxLength(50)
    numeroPlano: string;
  }