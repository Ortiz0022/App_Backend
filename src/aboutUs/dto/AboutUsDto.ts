import { IsNotEmpty, IsString } from "class-validator";

export class AboutUsDto {

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}
