import { IsString } from 'class-validator';

export class ValidateSolicitudDto {
  @IsString()
  cedula: string;
}
