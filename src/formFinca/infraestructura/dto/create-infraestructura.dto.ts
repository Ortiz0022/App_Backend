import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateInfraestructuraDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  descripcion?: string;
}
