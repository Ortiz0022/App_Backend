import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateInfraestructuraDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  descripcion?: string;
}
