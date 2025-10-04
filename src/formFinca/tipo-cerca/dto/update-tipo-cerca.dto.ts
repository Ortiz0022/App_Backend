import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateTipoCercaDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombre?: string;
}
