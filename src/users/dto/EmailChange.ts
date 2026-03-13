import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class AdminSetPasswordDto {

  @IsString()
  @MinLength(6)
  password: string;

}

export class RequestEmailChangeDto {

  @IsEmail()
  @IsNotEmpty()
  newEmail: string;

}

export class ConfirmEmailChangeDto {

  @IsString()
  @IsNotEmpty()
  token: string;

}