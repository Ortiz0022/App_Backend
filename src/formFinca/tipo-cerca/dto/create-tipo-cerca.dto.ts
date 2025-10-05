import { IsBoolean } from 'class-validator';

export class CreateTipoCercaDto {
  @IsBoolean()
  viva: boolean;

  @IsBoolean()
  electrica: boolean;

  @IsBoolean()
  pMuerto: boolean; // "palo muerto"
}
