import { IsString, IsNotEmpty, MinLength } from "class-validator";

export class ResetPasswordDto {

  @IsString()
  @IsNotEmpty()
  resetPasswordToken: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

}