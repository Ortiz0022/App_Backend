import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateFuenteAguaDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombre?: string;
}
