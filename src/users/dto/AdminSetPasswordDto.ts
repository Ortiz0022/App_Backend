import { IsString, MinLength } from "class-validator";
import { Type } from "class-transformer";

export class AdminSetPasswordDto {

  @IsString()
  @MinLength(6)
  password: string;

}