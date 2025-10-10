import { IsNotEmpty, IsNumber, IsString, MaxLength, IsOptional } from 'class-validator';

export class CreateNecesidadesDto {
  @IsNumber()
  @IsOptional()
  idAsociado?: number; // Opcional porque se puede pasar el asociado directamente en transacción

  @IsNumber()
  @IsOptional()
  orden?: number; // Opcional, se auto-asigna si no viene

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  descripcion: string;
}