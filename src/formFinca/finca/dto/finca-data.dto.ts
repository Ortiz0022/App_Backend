import { IsNumber, IsString, MaxLength, Min } from "class-validator";
import { ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { CreateGeografiaDto } from "src/formFinca/geografia/dto/create-geografia.dto";


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

    @ValidateNested()
    @Type(() => CreateGeografiaDto)
    geografia: CreateGeografiaDto; 
  }