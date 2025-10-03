import {
    IsBoolean,
    IsEnum,
    IsOptional,
    IsString,
    MaxLength,
    ValidateNested,
  } from 'class-validator';
  import { Type } from 'class-transformer';
  import { AssociateStatus } from './associate-status.enum';
import { CreatePersonaDto } from 'src/formAssociates/persona/dto/create-persona.dto';
  
  export class CreateAssociateDto {
    // Datos de persona (nested)
    @ValidateNested()
    @Type(() => CreatePersonaDto)
    persona: CreatePersonaDto;
  
    // Datos específicos de asociado - Finca
    @IsOptional()
    @IsString()
    distanciaFinca?: string;
  
    @IsBoolean()
    viveEnFinca: boolean;
  
    // Ganado
    @IsOptional()
    @IsString()
    @MaxLength(100)
    marcaGanado?: string;
  
    @IsOptional()
    @IsString()
    @MaxLength(100)
    CVO?: string;
  
    // Estado (opcional, por defecto será PENDIENTE)
    @IsOptional()
    @IsEnum(AssociateStatus)
    estado?: AssociateStatus;
  }