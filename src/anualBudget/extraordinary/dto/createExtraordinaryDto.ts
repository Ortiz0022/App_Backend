// dto/createExtraordinaryDto.ts
import { IsNotEmpty, IsString, MaxLength, IsOptional, IsDateString, IsNumberString } from 'class-validator';

export class CreateExtraordinaryDto {
  @IsString() @IsNotEmpty() @MaxLength(120)
  name: string;

  // viene como string desde el front; validamos que sea número
  @IsNumberString()
  amount: string;

  @IsOptional()
  @IsDateString()
  date?: string; // yyyy-mm-dd
}
