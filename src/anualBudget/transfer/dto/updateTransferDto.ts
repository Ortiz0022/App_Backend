import { IsOptional, IsString, IsDateString, MaxLength } from 'class-validator';

export class UpdateTransferDto {
  @IsOptional() @IsString() @MaxLength(50)
  name?: string;

  @IsOptional() @IsDateString()
  date?: string;

  @IsOptional() @IsString() @MaxLength(255)
  detail?: string;
}
