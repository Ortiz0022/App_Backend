
import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";
import { Type } from "class-transformer";

export class CreateUserDto {

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @Type(() => Number)
  @IsInt()
  roleId: number;

}