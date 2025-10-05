import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateActividadDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombre?: string;
}
