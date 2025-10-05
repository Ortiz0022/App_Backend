import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCanalDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombre?: string;
}
