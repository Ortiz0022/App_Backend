import { IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class AdminSetPasswordDto {

  @IsString()
  @MinLength(6)
  password: string;

}

export class UpdateUserDto {

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  username?: string;

}