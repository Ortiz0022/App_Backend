import { IsNotEmpty, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePersonaDto } from 'src/formAssociates/persona/dto/create-persona.dto';

export class CreatePropietarioDto {
  @IsNotEmpty({ message: 'Los datos de la persona son obligatorios' })
  @IsObject({ message: 'persona debe ser un objeto' })
  @ValidateNested()
  @Type(() => CreatePersonaDto)
  persona: CreatePersonaDto;
}