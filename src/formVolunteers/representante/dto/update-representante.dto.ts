import {
  IsString,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class UpdateRepresentanteDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  cargo?: string;
}