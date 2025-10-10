import { IsBoolean } from 'class-validator';

export class CreateCorrienteDto {
  @IsBoolean()
  publica?: boolean;

  @IsBoolean()
  privada?: boolean;
}
