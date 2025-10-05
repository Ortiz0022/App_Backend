import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateTipoCercaDto {
  @IsOptional()
  @IsBoolean()
  viva?: boolean;

  @IsOptional()
  @IsBoolean()
  electrica?: boolean;

  @IsOptional()
  @IsBoolean()
  pMuerto?: boolean;
}
