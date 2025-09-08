import { IsInt, IsNumberString, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @MaxLength(120)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  // opcional; si no viene, BD pone 0.00
  @IsOptional()
  @IsNumberString()
  category_amount?: string;

  // relación obligatoria: a qué presupuesto pertenece
  @IsInt()
  @Min(1)
  projectionId: number;
}
