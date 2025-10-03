import { IsBoolean, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class QueryAssociateDto {
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  estado?: boolean; // filtrar por activos/inactivos

  @IsOptional()
  @IsString()
  search?: string; // búsqueda por nombre, cédula, email

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  sort?: string; // ejemplo: 'createdAt:desc' | 'persona.nombre:asc'
}