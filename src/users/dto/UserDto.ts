import { IsEmail, IsInt, IsNotEmpty, IsString, MinLength } from "class-validator";
import { Type } from "class-transformer";

export class AdminSetPasswordDto {

  @IsString()
  @MinLength(6)
  password: string;

}
export class UserDto {

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Type(() => Number)
  @IsInt()
  roleId: number;

}