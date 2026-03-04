import { IsOptional, IsString, IsDateString, IsNumberString, MaxLength } from 'class-validator';

export class UpdateExtraordinaryDto {
  @IsOptional() @IsString() @MaxLength(120)
  name?: string;

  @IsOptional() @IsNumberString()
  amount?: string;

  @IsOptional() @IsDateString()
  date?: string;
}
