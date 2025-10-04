import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTipoCercaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;
}
