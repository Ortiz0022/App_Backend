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
import { UpdatePersonaDto } from 'src/formAssociates/persona/dto/update-persona.dto';

  export class UpdateAssociateDto {
    // Datos de persona (nested, opcional)
    @IsOptional()
    @ValidateNested()
    @Type(() => UpdatePersonaDto)
    persona?: UpdatePersonaDto;
  
    // Datos específicos de asociado
    @IsOptional()
    @IsString()
    distanciaFinca?: string;
  
    @IsOptional()
    @IsBoolean()
    viveEnFinca?: boolean;
  
    @IsOptional()
    @IsString()
    @MaxLength(100)
    marcaGanado?: string;
  
    @IsOptional()
    @IsString()
    @MaxLength(100)
    CVO?: string;
  
    @IsOptional()
    @IsEnum(AssociateStatus)
    estado?: AssociateStatus;
  
    @IsOptional()
    @IsString()
    @MaxLength(255)
    motivoRechazo?: string;
  }