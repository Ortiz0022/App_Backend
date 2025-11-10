import { IsBoolean, IsOptional } from 'class-validator';

export class CreateTipoCercaDto {
  @IsOptional()
  @IsBoolean()
  alambrePuas?: boolean;

  @IsOptional()
  @IsBoolean()
  viva?: boolean;

  @IsOptional()
  @IsBoolean()
  electrica?: boolean;

  @IsOptional()
  @IsBoolean()
  pMuerto?: boolean; // "palo muerto"
}
