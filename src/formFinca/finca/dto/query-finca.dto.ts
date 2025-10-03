import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryFincaDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  idAsociado?: number; // Filtrar por asociado

  @IsOptional()
  @IsString()
  search?: string; // Buscar por nombre o número de plano
}