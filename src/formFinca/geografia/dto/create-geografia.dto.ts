import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateGeografiaDto {
  @IsNotEmpty({ message: 'La provincia es obligatoria' })
  @IsString({ message: 'La provincia debe ser un texto' })
  @MaxLength(100, { message: 'La provincia no puede exceder 100 caracteres' })
  provincia: string;

  @IsNotEmpty({ message: 'El cantón es obligatorio' })
  @IsString({ message: 'El cantón debe ser un texto' })
  @MaxLength(100, { message: 'El cantón no puede exceder 100 caracteres' })
  canton: string;

  @IsNotEmpty({ message: 'El distrito es obligatorio' })
  @IsString({ message: 'El distrito debe ser un texto' })
  @MaxLength(100, { message: 'El distrito no puede exceder 100 caracteres' })
  distrito: string;

  @IsOptional()
  @IsString({ message: 'El caserío debe ser un texto' })
  @MaxLength(100, { message: 'El caserío no puede exceder 100 caracteres' })
  caserio?: string;
}