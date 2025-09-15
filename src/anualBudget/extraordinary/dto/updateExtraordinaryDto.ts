// dto/updateExtraordinaryDto.ts (relevante a amount/date)
import { IsOptional, IsString, IsDateString, IsNumberString, MaxLength } from 'class-validator';
export class UpdateExtraordinaryDto {
  @IsOptional() @IsString() @MaxLength(120)
  name?: string;

  @IsOptional() @IsNumberString()
  amount?: string;  // permitir string numérico

  @IsOptional() @IsDateString()
  date?: string;

  @IsOptional()
  used?: number;
}
