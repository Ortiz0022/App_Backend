import { IsOptional, IsString } from "class-validator";

export class AboutUsPatchDto {
  @IsString()
  @IsOptional()
  title?: string;
  
  @IsString()
  @IsOptional()
  description?: string;
}