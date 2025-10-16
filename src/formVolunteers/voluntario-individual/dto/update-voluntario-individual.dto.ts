import {
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateVoluntarioIndividualDto {
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
}