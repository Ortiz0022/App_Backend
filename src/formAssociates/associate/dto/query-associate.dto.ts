import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { AssociateStatus } from './associate-status.enum';

export class QueryAssociateDto {
  @IsOptional()
  @IsEnum(AssociateStatus)
  status?: AssociateStatus;

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
  sort?: string; // ejemplo: 'createdAt:desc' | 'nombre:asc'
}