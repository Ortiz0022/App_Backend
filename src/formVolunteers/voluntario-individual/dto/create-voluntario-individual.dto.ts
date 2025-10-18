import {
  IsString,
  MaxLength,
  IsNotEmpty,
  ValidateNested,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePersonaDto } from 'src/formAssociates/persona/dto/create-persona.dto';


export class CreateVoluntarioIndividualDto {
  @ValidateNested()
  @Type(() => CreatePersonaDto)
  persona: CreatePersonaDto;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  motivacion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  habilidades?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  experiencia?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  nacionalidad?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}