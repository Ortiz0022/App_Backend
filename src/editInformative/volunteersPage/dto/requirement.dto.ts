import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class RequirementDto {
  @IsString() @IsNotEmpty() @MaxLength(1000)
  text: string;

  @IsInt() @IsOptional()
  order?: number;
}