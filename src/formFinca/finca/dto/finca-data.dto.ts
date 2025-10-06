import { IsNumber, IsString, MaxLength, Min } from "class-validator";
import { ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { CreateGeografiaDto } from "src/formFinca/geografia/dto/create-geografia.dto";


export class DatosFincaDto {
    @IsString()
    @MaxLength(100)
    nombre: string;
  
    @IsString() 
    @MaxLength(20)
    areaHa: string;  
  
    @IsString()
    @MaxLength(50)
    numeroPlano: string;

    @ValidateNested()
    @Type(() => CreateGeografiaDto)
    geografia: CreateGeografiaDto; 
  }