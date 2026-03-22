import { IsBoolean, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class QueryAssociateDto {
  @IsOptional()
  @Transform(({ value }) => {
    // ✅ Si no viene el parámetro, preservar undefined → sin filtro = devuelve todos
    if (value === undefined || value === null || value === '') return undefined;
    // ✅ Convertir string a booleano real para TypeORM
    if (value === 'true'  || value === true)  return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  estado?: boolean;

  @IsOptional()
  @IsString()
  search?: string;

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
  sort?: string;
}