import {
  IsString,
  MaxLength,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePersonaDto } from 'src/formAssociates/persona/dto/create-persona.dto';


export class CreateVoluntarioIndividualDto {
  @ValidateNested()
  @Type(() => CreatePersonaDto)
  persona: CreatePersonaDto;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  motivacion: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  habilidades: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  experiencia: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nacionalidad: string;
}