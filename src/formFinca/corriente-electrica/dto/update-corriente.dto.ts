import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateCorrienteDto {
  @IsOptional()
  @IsBoolean()
  publica?: boolean;

  @IsOptional()
  @IsBoolean()
  privada?: boolean;
}
