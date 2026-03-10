import { IsString, MinLength } from 'class-validator';

export class AdminSetPasswordDto {
  @IsString()
  @MinLength(8)
  password: string;
}