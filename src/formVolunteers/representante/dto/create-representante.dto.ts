import {
  IsString,
  IsNotEmpty,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePersonaDto } from '../../../formAssociates/persona/dto/create-persona.dto';

export class CreateRepresentanteDto {
  @ValidateNested()
  @Type(() => CreatePersonaDto)
  persona: CreatePersonaDto;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  cargo: string;
}